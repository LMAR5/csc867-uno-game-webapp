import { io } from "socket.io-client";
import { GAME_STATE_UPDATED, USER_NOT_TURN } from "../../backend/sockets/constants";

const addCardToList = (gameId, userId, cardId, cardValue, cardStyle) => {
    const gameIDListCardsGame =  "#cards_list_game_".concat(gameId);
    const cardsGameList = document.querySelector(gameIDListCardsGame); // HTMLElement
    const cardItemListTemplate = document.querySelector("#game_cards_lst_template"); // HTMLTemplateElement
    if (cardsGameList === null || cardItemListTemplate === null) {
        console.error("Card list of user not found");
        return;
    }
    const newCardListElement = cardItemListTemplate.content.cloneNode(true); // as HTMLElement;
    const labelElement = newCardListElement.querySelector("label");
    //label id: game_1_user_1_card_1_label
    labelElement.id = "game_".concat(gameId, "_user_", userId, "_card_", cardId, "_label");
    const inputElement = labelElement.querySelector("input");
    // input id: game_1_user_1_card_1
    inputElement.id = "game_".concat(gameId, "_user_", userId, "_card_", cardId);
    inputElement.value = cardValue;
    const spanElement = labelElement.querySelector("span");
    const cardDivElement = spanElement.querySelector("div");
    cardDivElement.className = "uno-card".concat(' ', cardStyle);
    cardsGameList.appendChild(newCardListElement);
}

const generateNotTurnAlert = (typeMsg) => {
    const newDiv = document.createElement("div");
    newDiv.className = `w-full max-w-md bg-blue-700 shadow-[0.8rem_1rem_0.5rem_rgba(0,0,0,0.1)] opacity-100 transition`;
    // newDiv.innerHTML = `
    //     <div class="flex items-center justify-between px-4 py-4 gap-2">
    //         <div class="text-red-500 text-2xl mt-1"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m10.25 5.75l-4.5 4.5m0-4.5l4.5 4.5"/><circle cx="8" cy="8" r="6.25"/></g></svg></div>
    //         <h2 class="text-sm text-red-500 font-semibold">Please with for your turn</h2>
    //         <div><iconify-icon class="text-2xl text-slate-300 hover:text-slate-500 hover:scale-110 rounded cursor-pointer mt-1" icon="system-uicons:cross"></iconify-icon></div>
    //     </div>
    // `;
    newDiv.innerHTML = `
    <div id="dialog-not-turn" class="relative z-10" role="dialog">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-50 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                            You cannot ${typeMsg}. Please wait for your turn.
                            </h3>                  
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
    `;
    const root = document.getElementById('root');
    root.appendChild(newDiv);
    setTimeout(() => {
        newDiv.classList.remove("opacity-100");
        newDiv.classList.add("opacity-0");
        setTimeout(() => {
            newDiv.remove();
        }, 1000);
    }, 3000);

}

const checkButtonPlay = () => {
    const playForm = document.querySelector("#play-form");
    if (playForm) {
        playForm.addEventListener("submit", (formSubmitEvent) => {
            formSubmitEvent.preventDefault();
            const url = formSubmitEvent.target.action;
            fetch(url, { method: "post" }).then(_ => console.log(`Fetched ${url}`));
        });
    }
}

const checkButtonDraw = () => {
    const drawForm = document.querySelector("#draw-form");
    if (drawForm) {
        drawForm.addEventListener("submit", (formSubmitEvent) => {
            formSubmitEvent.preventDefault();
            const url = formSubmitEvent.target.action;
            fetch(url, { method: "post" }).then(_ => console.log(`Fetched ${url}`));
        });
    }
}

const configure = (userSocketId) => {
    // Generates User Socket (with specific ID) so Backend can connect to it
    // This Socket is to send events to a SPECIFIC USER
    const userSocket = io({ query: { id: userSocketId } });

    // This socket is triggered by the GAME_START event.
    userSocket.on(GAME_STATE_UPDATED, ({ source, hand, gameId, playerId }) => {
        console.log({ event: GAME_STATE_UPDATED, source, hand, gameId, playerId });
        const gameIDListCardsGame =  "#cards_list_game_".concat(gameId);
        const cardsGameList = document.querySelector(gameIDListCardsGame); // HTMLElement
        if (cardsGameList === null) {
            console.error("Card list of user not found");
            return;
        }
        cardsGameList.innerHTML = "";
        // Add cards to the player's hand
        if (hand.length > 0) {
            hand.forEach((item, idx) => {
                addCardToList(gameId, playerId, item.id, item.value, item.style);
            });            
        }
    });

    userSocket.on(USER_NOT_TURN, ({ source, type, gameId, userId }) => {
        console.log({ event: USER_NOT_TURN, source, type, gameId, userId });        
        generateNotTurnAlert(type);
    });
}

export { configure, checkButtonPlay, checkButtonDraw }