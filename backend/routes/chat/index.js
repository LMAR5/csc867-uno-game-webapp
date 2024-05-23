import express from "express";

import { CHAT_MESSAGE, CHAT_MESSAGE_LOBBY } from "../../sockets/constants.js";
import { Games } from "../../db/index.js";

const router = express.Router();

router.post("/:id", async (request, response) => {
  const { id: roomId } = request.params;
  const { message } = request.body;
  const { email: senderEmail, gravatar } = request.session.user;
  const io = request.app.get("io");
    // if message was sent in lobby
    if (parseInt(roomId) > 0) {
        const { game_socket_id: gameSocketId } = await Games.getGameById(roomId);
    io.to(gameSocketId).emit(CHAT_MESSAGE, { 
        source: "Chat Game socket", 
        roomId, 
        message, 
        senderEmail, 
        gravatar, 
        timestamp: new Date() 
    });

    } else {
    // if message was sent in game room
    io.emit(CHAT_MESSAGE_LOBBY, { 
        source: "Chat Lobby socket", 
        roomId, 
        message, 
        senderEmail, 
        gravatar, 
        timestamp: new Date() 
    });
}
  response.status(200).send();
});

export default router;
