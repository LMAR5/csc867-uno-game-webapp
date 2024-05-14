import { io } from "socket.io-client";
import { GAME_STATE_UPDATED } from "../../backend/sockets/constants";

const configure = (userSocketId) => {
    const userSocket = io({ query: { id: userSocketId } });

    userSocket.on(GAME_STATE_UPDATED, data => {
        console.log({ event: GAME_STATE_UPDATED, data });
    });
}

export { configure }