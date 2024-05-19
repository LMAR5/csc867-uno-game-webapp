import { hiddeGameForm as createGameHideDialog, triggerDialog as createGameDialog } from './create-game-dialog';
import { configure as configGameSocket } from './game_socket';
import { configure as configUserSocket, checkButtonPlayerForm as btnPlay } from './user_sockets';

const gameSocketId = document.querySelector("#game-socket-id");
const userSocketId = document.querySelector("#user-socket-id");
const lobbyUserSocketId = document.querySelector("#lobby-user-socket-id");
if (gameSocketId) {
    configGameSocket(gameSocketId.value);
}
if (userSocketId) {
    configUserSocket(userSocketId.value);
} else if (lobbyUserSocketId) {
    configUserSocket(lobbyUserSocketId.value);
}

export default [createGameDialog, createGameHideDialog, btnPlay];