import { io } from "socket.io-client";
import { GAME_START, GAME_USER_ADDED, CHAT_MESSAGE, GAME_TEST, GAME_USER_DRAW, GAME_AFTER_PLAY, GAME_WINNER, GAME_SKIP_CARD } from "../../backend/sockets/constants";
import { generateMsg } from "../messages/chat-helpers";
import { addTopDiscardCard, generateNotTurnAlert } from "./gameplay-helpers";

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

const updateStatusGameRoom = (gameId, gameStatusLabel) => {
    const gameStatus =  "span#current_status_game_".concat(gameId);
    const gameStatusElement = document.querySelector(gameStatus);
    if (gameStatusElement === null) {
        console.error("Status of game room not found");
        return;
    }
    gameStatusElement.innerHTML = gameStatusLabel;
}

const updateListPlayersGameRoom = (gameId, hands) => {
    const gameIDListOfGame =  "#users_game_listing_".concat(gameId);
    const userGameList = document.querySelector(gameIDListOfGame); // HTMLElement
    if (userGameList === null) {
        console.error("Users game list not found");
        return;
    }
    // Remove all players of the Game Room list
    userGameList.innerHTML = "";
    // Re-fill players list (with updated card count)
    hands.forEach((item, idx) => {
        addPlayerToGameList(gameId, item.id, item.first_name, item.last_name, item.cardCount);
    });
}

const configure = (gameSocketId) => {
    // Generates Game Socket (with specific ID) to Backend can connect to it
    // This Socket is to send events to everybody in the GAME ROOM
    const gameSocket = io({ query: { id: gameSocketId } });

    gameSocket.on(GAME_START, ({ currentTurn, currentHands, currentGameData, gameId }) => {
        console.log({ event: GAME_START, currentTurn, currentHands, currentGameData, gameId });
        // Update number of players (next to Game Session/Room title)
        updateNumPlayersGameRoom(gameId, currentGameData.count);
        // Update status of game room (next to number of players)
        updateStatusGameRoom(gameId, currentGameData.status);
        // Update players list in Game Room (below Game Session/Room title)
        updateListPlayersGameRoom(gameId, currentGameData.users);
        // Update player's name for current turn
        updateCurrentGameRoomTurn(gameId, currentTurn.first_name, currentTurn.last_name);
        // Add top discard card on screen for all players
        addTopDiscardCard(gameId, currentGameData.first_discard.style);
    });

    gameSocket.on(GAME_TEST, console.log);

    gameSocket.on(GAME_USER_ADDED, ({ newUserData, gameId, gameSocketId, numPlayers }) => {
        console.log({ event: GAME_USER_ADDED, newUserData, gameId, gameSocketId, numPlayers });
        addPlayerToGameList(gameId, newUserData.id, newUserData.first_name, newUserData.last_name, newUserData.cardCount);
        // Update number of players (next to Game Session/Room title)
        updateNumPlayersGameRoom(gameId, numPlayers);
    });

    gameSocket.on(GAME_USER_DRAW, ({ source, gameHands, gameId, playerId }) => {
        console.log({ event: GAME_USER_DRAW, source, gameHands, gameId, playerId });
        updateListPlayersGameRoom(gameId, gameHands);
    });

    gameSocket.on(GAME_AFTER_PLAY, ({ source, discardCard, gameHands, currentTurn, gameId, playerId }) => {
        console.log({ event: GAME_AFTER_PLAY, source, discardCard, gameHands, currentTurn, gameId, playerId });
        updateListPlayersGameRoom(gameId, gameHands);
        updateCurrentGameRoomTurn(gameId, currentTurn.first_name, currentTurn.last_name);
        addTopDiscardCard(gameId, discardCard.style);
    });

    gameSocket.on(GAME_WINNER, ({ source, winner, gameId, winnerId }) => {
        console.log({ event: GAME_WINNER, source, winner, gameId, winnerId });
        document.location.href = `/games/${gameId}/game-end`;
    });

    gameSocket.on(GAME_SKIP_CARD, ({ source, msg, gameId, userId }) => {
        console.log({ event: GAME_SKIP_CARD, source, msg, gameId, userId });
        generateNotTurnAlert(msg);
    });

    gameSocket.on(CHAT_MESSAGE, ({ roomId, message, senderEmail, gravatar, timestamp }) => {
        console.log('Chat message received');
        generateMsg(message, senderEmail, gravatar, timestamp, '#chat-message-area');
    });
}

export { configure };