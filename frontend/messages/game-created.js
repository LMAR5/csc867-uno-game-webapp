//import { Socket } from "socket.io-client";

import { GAME_CREATED } from "../../backend/sockets/constants";

export default function handle(socket) {
  //const gamesList = document.querySelector<HTMLElement>("#available-games-list");  
  //const availableGameTemplate = document.querySelector<HTMLTemplateElement>("#available-game-template");
  const gamesList = document.querySelector("#available-games-list"); // HTMLElement
  const availableGameTemplate = document.querySelector("#available-game-template"); // HTMLTemplateElement

  socket.on(
    GAME_CREATED,
    ({
      gameId, //number
      creatorEmail, //string
      creatorGravatar, //string
      description, //string
      number_players, //int
    }) => {
      if (gamesList === null || availableGameTemplate === null) {
        console.error("Games list or template not found");
        return;
      }

      const newGameElement = availableGameTemplate.content.cloneNode(true); // as HTMLElement;
      //const liElement = newGameElement.querySelector<HTMLElement>("li");
      const liElement = newGameElement.querySelector("li"); // HTMLElement
      console.log(liElement);
      liElement.dataset.gameId = gameId.toString();

      //const img = newGameElement.querySelector<HTMLImageElement>("img");
      const img = newGameElement.querySelector("img#user_img"); // HTMLImageElement
      img.src = `https://gravatar.com/avatar/${creatorGravatar}`;
      img.alt = `${creatorEmail.substring(0, creatorEmail.indexOf("@"))}'s gravatar`;

      //const descriptionElement = newGameElement.querySelector<HTMLElement>(".game-description");
      const descriptionElement = newGameElement.querySelector("p#game_description"); // HTMLElement
      descriptionElement.innerText = description;

      const emailCreatorElement = newGameElement.querySelector("p#creator_email");
      emailCreatorElement.innerText = creatorEmail.substring(0, creatorEmail.indexOf("@"));

      const numberPlayersElement = newGameElement.querySelector("span#number_players_game");
      numberPlayersElement.innerText = "1 out of ".concat(number_players, " Playing (Waiting for more)");

      //const joinForm = newGameElement.querySelector<HTMLFormElement>("form");
      const joinForm = newGameElement.querySelector("form"); // HTMLFormElement
      joinForm.action = `/games/join/${gameId}`;

      gamesList.appendChild(newGameElement);
    },
  );
}
