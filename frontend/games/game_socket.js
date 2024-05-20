import { io } from "socket.io-client";
import { GAME_START, GAME_USER_ADDED, CHAT_MESSAGE } from "../../backend/sockets/constants";
import { generateMsg } from "../messages/chat-helpers";

const configure = (gameSocketId) => {
    const gameSocket = io({ query: { id: gameSocketId } });
    gameSocket.on(GAME_START, data => {
        console.log({ event: GAME_START, data });
    });

    gameSocket.on(GAME_USER_ADDED, data => {
        console.log({ event: GAME_USER_ADDED, data });
    });

    gameSocket.on(CHAT_MESSAGE, ({ roomId, message, senderEmail, gravatar, timestamp }) => {
        console.log('Chat message received');
        generateMsg(message, senderEmail, gravatar, timestamp, '#chat-message-area')
    });
}

export { configure };