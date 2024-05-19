import express from "express";

import { Games, Users } from "../../db/index.js";

const router = express.Router();

router.get("/", async (request, response) => {
  const { id: userId } = request.session.user;

  try {
    const availableGames = await Games.available(userId);
    const userSocketId = await Users.getUserSocket(userId);
    const lobbyUserSocketId = userSocketId.sid;
        
    response.render("lobby/lobby", { availableGames, lobbyUserSocketId });
  } catch (error) {
    console.error(error);
    response.render("lobby/lobby", { availableGames: [] });
  }
});

export default router;
