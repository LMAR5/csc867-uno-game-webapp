import express from "express";

import { Games } from "../../db/index.js";
import { GAME_CREATED, GAME_REMOVED } from "../../sockets/constants.js";

const router = express.Router();

router.post("/create", async (request, response) => {
  const { id: creatorId, gravatar: creatorGravatar, email: creatorEmail } = request.session.user;  
  const { description, number_players } = request.body;
  try {
    const io = request.app.get("io");
    const { id, description: finalDescription, finalNumberPlayers } = await Games.create(creatorId, description, number_players);
    
    io.of('/').adapter.rooms.set(id, new Set()); // Create a new room for the game for msging

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
  const gameData = await Games.get(id);

  response.render("games/games", gameData);
});

router.post("/join/:id", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    const io = request.app.get("io");
    await Games.join(gameId, userId);

    io.emit(GAME_REMOVED, { gameId });

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
    response.redirect("/lobby");
  }
});

export default router;
