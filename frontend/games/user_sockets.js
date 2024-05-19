import { io } from "socket.io-client";
import { USER_GAME_STARTED, USER_NOT_TURN, USER_NOT_IN_GAME, USER_TEST, GAME_CARD_VALIDATION, USER_DRAW, USER_GAME_NOT_INIT } from "../../backend/sockets/constants";
import { addCardToList, generateNotTurnAlert, getGameRadioValues } from "./gameplay-helpers";

const getCardRadioValue = () => {
    const userRadioCards = document.querySelector('input[name="game_radio_values"]:checked');
    if (userRadioCards) {
        return userRadioCards.value;
    }
}

const resetSelectedCardLabel = () => {
    const selectedCard = document.querySelector("span#game_selected_card");
    if (selectedCard) {
        selectedCard.textContent = "";
    }
}

const resetPlayerForm = () => {
    const playForm = document.querySelector("#player-form");
    if (playForm) {
        playForm.reset();
    }
}

const checkButtonPlayerForm = () => {
    const playForm = document.querySelector("#player-form");
    if (playForm) {
        playForm.addEventListener("submit", (formSubmitEvent) => {
            formSubmitEvent.preventDefault();
            if (formSubmitEvent.submitter.id !== "") {
                let url = formSubmitEvent.submitter.formAction;
                switch (formSubmitEvent.submitter.id) {
                    case 'game_draw_btn':
                        playForm.reset();
                        resetSelectedCardLabel();
                        fetch(url, { 
                            method: "POST"
                        }).then(_ => console.log(`Fetched ${url}`));
                        break;
                    case 'game_test_btn':
                        fetch(url, { 
                            method: "POST"
                        }).then(_ => console.log(`Fetched ${url}`));
                        break;
                    default:
                        const cardValue = getCardRadioValue();
                        if (!cardValue) {
                            generateNotTurnAlert('You cannot play without selecting a card. Please try again.');
                            break;
                        }
                        fetch(url, { 
                            method: "POST", 
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                                cardId: cardValue
                            }),
                        }).then(_ => console.log(`Fetched ${url}`));
                        break;
                }
            }
        });
        playForm.addEventListener("reset", (_) => {
            resetSelectedCardLabel();
        });
    }
}

const updateCardsInPlayerHand = (gameId, playerId, playerHand) => {
    const gameIDListCardsGame =  "#cards_list_game_".concat(gameId);
    const cardsGameList = document.querySelector(gameIDListCardsGame); // HTMLElement
    if (cardsGameList === null) {
        console.error("Card list of user not found");
        return;
    }
    cardsGameList.innerHTML = "";
    // Add cards to the player's hand
    if (playerHand.length > 0) {
        playerHand.forEach((item, idx) => {
            addCardToList(gameId, playerId, item.id, item.value, item.style, item.name);
        });
    }
}

const configure = (userSocketId) => {
    // Generates User Socket (with specific ID) so Backend can connect to it
    // This Socket is to send events to a SPECIFIC USER
    const userSocket = io({ query: { id: userSocketId } });

    // This socket is triggered by the GAME_START event.
    userSocket.on(USER_GAME_STARTED, ({ source, hand, gameId, playerId }) => {
        console.log({ event: USER_GAME_STARTED, source, hand, gameId, playerId });
        updateCardsInPlayerHand(gameId, playerId, hand);        
        getGameRadioValues();
    });

    userSocket.on(USER_NOT_TURN, ({ source, msg, gameId, userId }) => {
        console.log({ event: USER_NOT_TURN, source, msg, gameId, userId });
        generateNotTurnAlert(msg);
        resetSelectedCardLabel();
        resetPlayerForm();
    });

    userSocket.on(USER_TEST, console.log);

    userSocket.on(GAME_CARD_VALIDATION, ({ source, msg, gameId, userId }) => {
        console.log({ event: GAME_CARD_VALIDATION, source, msg, gameId, userId });
        generateNotTurnAlert(msg);
        resetSelectedCardLabel();
        resetPlayerForm();
    });

    userSocket.on(USER_GAME_NOT_INIT, ({ source, msg, gameId, userId }) => {
        console.log({ event: USER_GAME_NOT_INIT, source, msg, gameId, userId });
        generateNotTurnAlert(msg);
        resetSelectedCardLabel();
        resetPlayerForm();
    });

    // userSocket.on(USER_NOT_IN_GAME, ({ source, type, gameId, userId }) => {
    //     console.log({ event: USER_NOT_IN_GAME, source, type, gameId, userId });
    //     generateNotTurnAlert(type);
    // });
    
    userSocket.on(USER_DRAW, ({ source, hand, gameId, playerId }) => {
        console.log({ event: USER_DRAW, source, hand, gameId, playerId }); 
        updateCardsInPlayerHand(gameId, playerId, hand);        
        getGameRadioValues();
    });
    getGameRadioValues();
}

export { configure, checkButtonPlayerForm }