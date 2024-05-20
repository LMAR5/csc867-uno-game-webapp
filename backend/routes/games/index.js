import express from "express";

import { Games, Users } from "../../db/index.js";
import { GAME_CREATED, GAME_REMOVED, GAME_START, GAME_TEST, GAME_USER_ADDED, USER_TEST, USER_GAME_STARTED, USER_NOT_TURN, USER_NOT_IN_GAME, GAME_CARD_VALIDATION, USER_DRAW, GAME_USER_DRAW, USER_GAME_NOT_INIT, USER_AFTER_PLAY, GAME_AFTER_PLAY, GAME_WINNER, GAME_SKIP_CARD } from "../../sockets/constants.js";

const router = express.Router();

router.post("/:id/test", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId, email: userEmail } = request.session.user;
  const { sid: userSocketId } = await Users.getUserSocket(userId);
  const { game_socket_id: gameSocketId } = await Games.getGameById(gameId);

  const io = request.app.get("io");
  
  // Emits a test msg to a specific user
  io.to(userSocketId).emit(USER_TEST, {
    source: "User socket",
    gameId,
    userId,
    userSocketId,
    gameSocketId,
  });
  // Emits a test msg to all users in the same game room
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
    const { id, description: finalDescription, numberPlayers: finalNumberPlayers } = await Games.create(creatorId, description, number_players);
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

router.get("/:id/game-end", async (request, response) => {  
  const { id } = request.params;    
  const gameWon = await Games.getGameById(id);
  const playerWinner = await Games.getWinnerByGameId(id);  
  response.render("games/game-end", { winner: playerWinner, game: gameWon });
});

router.get("/:id", async (request, response) => {
  const { id } = request.params;  
  const { id: userId } = request.session.user;
  try {    
    // Check if there is already a winner
    const isGameWinner = await Games.isThereWinnerByGameId(id);
    if (isGameWinner) {
      response.redirect(`/games/${id}/game-end`);
      return;
    }
    // Check if user belongs to this game session/room
    const isPlayerInGame = await Games.isPlayerInGame(id, userId);
    if (!isPlayerInGame) {
      // Reaload lobby page if player not in the game
      response.redirect("/lobby");
    }    
    const gameData = await Games.get(id);
    const userSocketId = await Users.getUserSocket(userId);
    gameData.user_socket_id = userSocketId.sid;
    gameData.screen_user_id = userId;
    console.log("gameData:", gameData);
    response.render("games/games", gameData);
  } catch (error) {
    console.log(error);
  }
});

router.post("/:id/play", async (request, response) => {
  const { id: gameId } = request.params;  
  const { id: userId } = request.session.user;
  const playerCardId = request.body.cardId;
  try {
    const io = request.app.get("io");
    const { sid: userSocketId } = await Users.getUserSocket(userId);
    // Validate if game already started or not. If not, emit message to user.
    const isGameInitialized = await Games.isGameInitialized(gameId);
    if (!isGameInitialized) {
      io.to(userSocketId).emit(USER_GAME_NOT_INIT, {
        source: "User socket",
        msg: "Game has not started yet. Please wait for other players to join.",
        gameId,
        userId
      });
      response.status(200).send();
      return;
    }
    // Validate if it's user's turn
    const isPlayersTurn = await Games.isCurrentPlayerTurn(gameId, userId);
    if (!isPlayersTurn) {
      // Emit directly to user that it's not his/her turn
      io.to(userSocketId).emit(USER_NOT_TURN, {
        source: "User socket",
        msg: "You cannot play. Please wait for your turn.",
        gameId,
        userId
      });
      response.status(200).send();
      return;
    }

    // Check if it's a valid play
    const topDiscardCard = await Games.getTopDiscardCard(gameId);
    const isCardPlayedValid = await Games.isCardPlayValid(playerCardId, topDiscardCard.id);
    if (!isCardPlayedValid) {
      // Emit message to user saying card is not valid
      io.to(userSocketId).emit(GAME_CARD_VALIDATION, {
        source: "User socket",
        msg: "Invalid play. Please try again with another card.",
        gameId,
        userId
      });
      response.status(200).send();
      return;
    }
    const { game_socket_id: gameSocketId } = await Games.getGameById(gameId);
    let turnUpdates = 1;
    // Check if it's a skip card
    const isCardSkipType = await Games.isSkipCard(playerCardId);
    if (isCardSkipType) {
      turnUpdates += 1;
      io.to(gameSocketId).emit(GAME_SKIP_CARD, { 
        source: "Game socket",
        msg: "Skip card has been played!",
        gameId,
        userId
      });
    }
    // Check if it's a draw 2 card to affect next player (Pending)
    // Move the player's card from player's hand to game's discard pile
    await Games.addNewTopDiscardCard(topDiscardCard.card_order, gameId, playerCardId);    
    // Update game's current turn
    if (turnUpdates > 1) {
      Games.updateGameCurrentTurn(1, gameId, userId).then(result => {
        Games.updateGameCurrentTurn(2, gameId, userId).then(result2 => {
          return;
        });
      });      
    } else {
      await Games.updateGameCurrentTurn(1, gameId, userId);
    }    
    // Get updated hand for user socket emit
    const playerHand = await Games.getCardsByUser(gameId, userId);
    // Check if player won
    if (playerHand.length === 0) {      
      await Games.setWinnerByGameId(userId, gameId);
      // Game socket to let everybody knows there is a winner.
      const userWinner = await Users.getUserById(userId);
      io.to(gameSocketId).emit(GAME_WINNER, { 
        source: "Game socket",
        winner: userWinner,
        gameId,
        winnerId: userId
      });
      response.status(200).send();
      return;
    }    
    // User socket to update player's hand
    io.to(userSocketId).emit(USER_AFTER_PLAY, {
      source: "User socket",
      hand: playerHand,
      gameId,
      playerId: userId
    });
    // Game socket to: [1] replace top discard card, [2] update player's card count, [3] next turn
    const newTopDiscardCard = await Games.getTopDiscardCard(gameId);
    const gameInfo = await Games.get(gameId);    
    const currentPlayer = await Games.getCurrentUserByGameId(gameId);
    let playersLst = [];
    // List of players with their card count updated
    gameInfo.users.forEach((item) => {
      playersLst.push({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        cardCount: item.cardCount
      });
    });    
    // Game socket
    io.to(gameSocketId).emit(GAME_AFTER_PLAY, { 
      source: "Game socket",
      discardCard: newTopDiscardCard,
      gameHands: playersLst,
      currentTurn: currentPlayer,
      gameId,
      playerId: userId
    });

    response.status(200).send();
  } catch (error) {
    console.log(error);
    response.redirect(`/games/${gameId}`);
  }
});

router.post("/:id/draw", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    const io = request.app.get("io");
    const { sid: userSocketId } = await Users.getUserSocket(userId);
    // Validate if game already started or not. If not, emit message to user.
    const isGameInitialized = await Games.isGameInitialized(gameId);
    if (!isGameInitialized) {
      io.to(userSocketId).emit(USER_GAME_NOT_INIT, {
        source: "User socket",
        msg: "Game has not started yet. Please wait for other players to join.",
        gameId,
        userId
      });
      response.status(200).send();
      return;
    }
    // Validate if it's user's turn
    const isPlayersTurn = await Games.isCurrentPlayerTurn(gameId, userId);    
    if (!isPlayersTurn) {
      // Emit directly to user that it's not his/her turn      
      io.to(userSocketId).emit(USER_NOT_TURN, {
        source: "User socket",
        msg: "You cannot draw. Please wait for your turn.",
        gameId,
        userId
      });
      response.status(200).send();
      return;
    }

    // Draw a card from deck and deal it to User's hand
    const newCard = await Games.drawOneCardFromDeck(gameId);
    const playerCurrentHand = await Games.getCardsByUser(gameId, userId);
    await Games.dealCardToPlayer(userId, newCard.id, gameId, playerCurrentHand.length);

    // Broadcast state of game
    // Update [1] list of cards and [2] the num of cards for the user who drew (User socket)
    const newPlayerHand = await Games.getCardsByUser(gameId, userId);    
    io.to(userSocketId).emit(USER_DRAW, { 
      source: "User socket",
      hand: newPlayerHand,
      gameId,
      playerId: userId
    });
    // Update number of cards for other users to see (Game socket)
    const { game_socket_id: gameSocketId } = await Games.getGameById(gameId);
    const gameInfo = await Games.get(gameId);
    let hands = [];
    gameInfo.users.forEach((item) => {
      hands.push({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        cardCount: item.cardCount
      });
    });    
    io.to(gameSocketId).emit(GAME_USER_DRAW, { 
      source: "Game socket",
      gameHands: hands,
      gameId,
      playerId: userId
    });

    response.status(200).send();
  } catch (error) {
    console.log(error);
    response.redirect(`/games/${gameId}`);
  }
});

router.post("/join/:id", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    const io = request.app.get("io");
    await Games.join(gameId, userId);
    const gameData = await Games.getGameById(gameId);
    const gameSocketId = gameData.game_socket_id;
    const gameInfoForUsersLst = await Games.get(gameId);
    const userJoined = await Users.getUserById(userId);
    let newUserData = null;
    gameInfoForUsersLst.users.forEach((user, idx) => {
      if (user.id == userJoined.id) {
        newUserData = user;
      }
    });
    const currentNumPlayers = await Games.userCount(gameId);
    if (currentNumPlayers < gameData.number_players) {
      io.emit(GAME_USER_ADDED, { newUserData, gameId, gameSocketId, numPlayers: currentNumPlayers });
    }
    
    // What happens if the game session is full and ready to start?
    if (currentNumPlayers == gameData.number_players) {
      // Perform initial setup and emit initial game state   
      const gameState = await Games.initialize(gameId);
      const afterInitGameInfo = await Games.get(gameId);
      // Send to the Game socket who's turn is it     
      io.to(gameSocketId).emit(GAME_START, { 
        source: "Game socket",
        currentTurn: gameState.current_player,
        currentHands: gameState.hands,
        currentGameData: afterInitGameInfo,
        gameId 
      });

      // Send to specific users their current hands
      Object.keys(gameState.hands).forEach(playerId => {        
        Users.getUserSocket(playerId).then((playerSocket) => {          
          io.to(playerSocket.sid).emit(USER_GAME_STARTED, { 
            source: "User socket", 
            hand: gameState.hands[playerId],
            gameId,
            playerId
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
