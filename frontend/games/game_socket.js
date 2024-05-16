import { io } from "socket.io-client";
import { GAME_START, GAME_USER_ADDED } from "../../backend/sockets/constants";

const addPlayerToGameList = (gameId, playerId, playerFirstName, playerLastName, playerCardCount) => {
    const gameIDListOfGame =  "#users_game_listing_".concat(gameId);
    const userGameList = document.querySelector(gameIDListOfGame); // HTMLElement
    const userItemListTemplate = document.querySelector("#game_users_lst_template"); // HTMLTemplateElement
    if (userGameList === null || userItemListTemplate === null) {
        console.error("Users game list or template not found");
        return;
    }
    const newUserListElement = userItemListTemplate.content.cloneNode(true); // as HTMLElement;
    const divElement = newUserListElement.querySelector("div");
    divElement.id = "user_list_item_".concat(playerId);
    const spanElement = divElement.querySelector("span");
    spanElement.textContent = playerFirstName.concat(' ',playerLastName);
    const pElement = divElement.querySelector("p");
    pElement.textContent = playerCardCount;
    userGameList.appendChild(newUserListElement);
}

const updateCurrentGameRoomTurn = (gameId, turnFirstName, turnLastName) => {
    const gameIDCurrTurnGame =  "#current_turn_game_".concat(gameId);
    const turnGameElement = document.querySelector(gameIDCurrTurnGame); // HTMLElement
    if (turnGameElement === null) {
        console.error("Current player's turn was not found");
        return;
    }
    turnGameElement.textContent = turnFirstName.concat(' ', turnLastName);
}

const updateNumPlayersGameRoom = (gameId, numberPlayers) => {
    const numPlayersOfGame =  "#num_joined_players_game_".concat(gameId);
    const numPlayersElement = document.querySelector(numPlayersOfGame); // HTMLElement
    if (numPlayersElement === null) {
        console.error("Users number of current players not found");
        return;
    }
    numPlayersElement.innerHTML = numberPlayers;
}

const configure = (gameSocketId) => {
    // Generates Game Socket (with specific ID) to Backend can connect to it
    // This Socket is to send events to everybody in the GAME ROOM
    const gameSocket = io({ query: { id: gameSocketId } });

    gameSocket.on(GAME_START, ({ currentTurn, currentHands, currentGameData, gameId }) => {
        console.log({ event: GAME_START, currentTurn, currentHands, currentGameData, gameId });
        // 1. Update number of players (label next to the title of Game Session/Room)
        updateNumPlayersGameRoom(gameId, currentGameData.count);
        // 2. Update list of player's in Game Room (below Game Session/Room title)
        const gameIDListOfGame =  "#users_game_listing_".concat(gameId);
        const userGameList = document.querySelector(gameIDListOfGame); // HTMLElement
        if (userGameList === null) {
            console.error("Users game list not found");
            return;
        }
        // 2.1. Remove all players of the Game Room list
        userGameList.innerHTML = "";
        // 2.2. Re-fill players list (with updated card count) in the Game Room
        currentGameData.users.forEach((item, idx) => {
            addPlayerToGameList(gameId, item.id, item.first_name, item.last_name, item.cardCount);
        });
        // 3. Update Player's name for current turn
        updateCurrentGameRoomTurn(gameId, currentTurn.first_name, currentTurn.last_name);
    });

    gameSocket.on(GAME_USER_ADDED, 
        ({ 
            newUserData,
            gameId,
            gameSocketId
        }) => {
            console.log({ event: GAME_USER_ADDED, newUserData, gameId, gameSocketId });
            addPlayerToGameList(gameId, newUserData.id, newUserData.first_name, newUserData.last_name, newUserData.cardCount);
    } );
}

export { configure };