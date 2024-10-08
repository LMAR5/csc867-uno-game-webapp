import { GAME_REMOVED } from "../../backend/sockets/constants";

const gamesList = document.querySelector("#available-games-list"); // HTMLElement

export default function handle(socket) {
  socket.on(GAME_REMOVED, ({ gameId }) => {
    const gameElement = document.querySelector(`[data-game-id="${gameId}"]`); // HTMLElement

    if (gamesList === null || gameElement === null) {
      console.error("Games list or game element not found");
      return;
    }

    gamesList.removeChild(gameElement);
  });
}
