const buttonCreate = document.querySelector("#create-game");
const buttonCreateGameCancel = document.querySelector("#create-game-cancel");
const dialogCreateGame = document.querySelector("#dialog-create-game");

export const triggerDialog = () => {
    if (buttonCreate) {
        buttonCreate.addEventListener("click", () => {
            dialogCreateGame.classList.remove('hidden');
        });
    }
}

export const hiddeGameForm = () => {
    const inputGameDesc = document.querySelector("input#description");
    const inputGameNumPlayers = document.querySelector("select#number_players");
    if (buttonCreateGameCancel) {
        buttonCreateGameCancel.addEventListener("click", () => {            
            inputGameDesc.value = "";
            inputGameNumPlayers.selectedIndex = 0;
            dialogCreateGame.classList.add('hidden');
        });
    }
}