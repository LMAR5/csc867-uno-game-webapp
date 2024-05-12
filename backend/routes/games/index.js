import express from "express";

import { Games, Users } from "../../db/index.js";
import { GAME_CREATED, GAME_REMOVED, GAME_START, GAME_TEST, GAME_USER_ADDED, USER_TEST, GAME_STATE_UPDATED } from "../../sockets/constants.js";

const router = express.Router();

router.post("/:id/test", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId, email: userEmail } = request.session.user;
  const { sid: userSocketId } = await Users.getUserSocket(userId);
  const { game_socket_id: gameSocketId } = await Games.getGameById(gameId);

  const io = request.app.get("io");
  
  //Emits a msg to a specific user from userSocketId or gameSocketId (console)
  io.to(userSocketId).emit(USER_TEST, {
    source: "User socket",
    gameId,
    userId,
    userSocketId,
    gameSocketId,
  });
  io.to(gameSocketId).emit(GAME_TEST, {
    source: "Game socket",
    gameId,
    userId,
    userSocketId,
    gameSocketId,
  });

  response.status(200).send();
});

router.post("/create", async (request, response) => {
  const { id: creatorId, gravatar: creatorGravatar, email: creatorEmail } = request.session.user;  
  const { description, number_players } = request.body;
  try {
    const io = request.app.get("io");
    const { id, description: finalDescription, finalNumberPlayers } = await Games.create(creatorId, description, number_players);
    io.emit(GAME_CREATED, {
      gameId: id,
      description: finalDescription,
      number_players: finalNumberPlayers,
      creatorGravatar,
      creatorEmail,
    });

    response.redirect(`/games/${id}`);
  } catch (error) {
    // If we were nice we would provide the user with an error message
    response.redirect("/lobby");
  }
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;
  const { id: userId } = request.session.user;
  const gameData = await Games.get(id);
  const userSocketId = Users.getUserSocket(userId);
  gameData.user_socket_id = userSocketId.sid;
  
  response.render("games/games", gameData);
});

router.post("/join/:id", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    const io = request.app.get("io");
    await Games.join(gameId, userId);
    const gameData = await Games.getGameById(gameId);
    const gameSocketId = gameData.game_socket_id;
    
    io.emit(GAME_USER_ADDED, { userId, gameId, gameSocketId });
    const currentNumPlayers = await Games.userCount(gameId);
    // What happens if the game session is full and ready to start?
    if (currentNumPlayers == gameData.number_players) {
      // Perform initial setup and emit initial game state   
      const gameState = await Games.initialize(gameId); 
      // Send to the Game socket who's turn is it     
      io.to(gameSocketId).emit(GAME_START, { 
        source: "Game socket",
        currentTurn: gameState.current_player,
        currentHands: gameState.hands,
        gameId 
      });

      // Send to specific users their current hands
      Object.keys(gameState.hands).forEach(playerId => {        
        Users.getUserSocket(playerId).then((playerSocket) => {          
          io.to(playerSocket.sid).emit(GAME_STATE_UPDATED, { 
            source: "User socket", 
            hand: gameState.hands[playerId]
          });
        });        
      });
      

      // Remove Game session from list of available games
      io.emit(GAME_REMOVED, { 
        gameId 
      });
    }

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
    response.redirect("/lobby");
  }
});

export default router;
