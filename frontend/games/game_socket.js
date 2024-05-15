import { io } from "socket.io-client";
import { GAME_START, GAME_USER_ADDED } from "../../backend/sockets/constants";

const configure = (gameSocketId) => {
    const gameSocket = io({ query: { id: gameSocketId } });
    gameSocket.on(GAME_START, data => {
        console.log({ event: GAME_START, data });
    });

    gameSocket.on(GAME_USER_ADDED, data => {
        console.log({ event: GAME_USER_ADDED, data });
    });
}

export { configure };