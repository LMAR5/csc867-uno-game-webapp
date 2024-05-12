import { triggerDialog as createGameDialog } from './create-game-dialog';
import { hiddeGameForm as createGameHideDialog } from './create-game-dialog';
import { testSockets } from './game-tests';
import { configure as configGameSocket } from './game_socket';
import { configure as configUserSocket } from './user_sockets';

const gameSocketId = document.querySelector("#game-socket-id");
const userSocketId = document.querySelector("#user-socket-id");
if (gameSocketId) {
    configGameSocket(gameSocketId.value);
}
if (userSocketId) {
    configUserSocket(userSocketId.value);
}

export default [createGameDialog, createGameHideDialog, testSockets];