
// Add top card of discard pile to game room
const addTopDiscardCard = (gameId, cardStyle) => {
    const gameTopDiscardCard =  "#discard_card_game_".concat(gameId);
    const discardCard = document.querySelector(gameTopDiscardCard); // HTMLElement
    if (discardCard === null) {
        console.error("Discard card not found");
        return;
    }
    discardCard.innerHTML = "";    
    const newDiv = document.createElement("div");
    newDiv.className = "uno-card".concat(' ', cardStyle);
    discardCard.appendChild(newDiv);
}

// Add card to list of specific user
const addCardToList = (gameId, userId, cardId, cardValue, cardStyle, cardName) => {
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
    inputElement.value = cardId;
    inputElement.placeholder = cardName;
    const spanElement = labelElement.querySelector("span");
    const cardDivElement = spanElement.querySelector("div");
    cardDivElement.className = "uno-card".concat(' ', cardStyle);
    cardsGameList.appendChild(newCardListElement);
}

// Generate Alert dialog with timer to user (Not your turn, select a card first, etc.)
const generateNotTurnAlert = (typeMsg) => {
    const newDiv = document.createElement("div");
    newDiv.className = `w-full max-w-md bg-blue-700 shadow-[0.8rem_1rem_0.5rem_rgba(0,0,0,0.1)] opacity-100 transition`;    
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
                            ${typeMsg}
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

// Get the input value of the UNO card to show them in the "Selected card" label.
const getGameRadioValues = () => {
    const userRadioCards = document.querySelectorAll('input[name="game_radio_values"]');
    const selectedCard = document.querySelector("span#game_selected_card");
    if (userRadioCards && selectedCard) {
        userRadioCards.forEach(radio => {
            radio.addEventListener('click', function () {
                radioVal = radio.placeholder;
                console.log("card value:", radioVal, "card ID:", radio.value);
                selectedCard.textContent = radioVal;
            });
        });
    }
}

export { addCardToList, generateNotTurnAlert, addTopDiscardCard, getGameRadioValues };