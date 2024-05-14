import { io } from "socket.io-client";
import { GAME_TEST, USER_TEST } from "../../backend/sockets/constants";

const gameSocketId = document.querySelector("#game-socket-id");
const userSocketId = document.querySelector("#user-socket-id");
// We need to prevent dwfault in the form, and for that we need to use an event handler on the test form
const testForm = document.querySelector("#test-form");

const testSockets = () => {   
    if (testForm) {
        testForm.addEventListener("submit", (formSubmitEvent) => {    
            formSubmitEvent.preventDefault();
            const url = formSubmitEvent.target.action;
            fetch(url, { method: "post" }).then(_ => console.log(`Fetched ${url}`));
        });  
    }     
        
    if (gameSocketId) {
        const gameSocket = io({ query: { id: gameSocketId.value } });
        gameSocket.on(GAME_TEST, console.log);
    }    
    if (userSocketId) {        
        const userSocket = io({ query: { id: userSocketId.value } });
        userSocket.on(USER_TEST, console.log);
    }   
    
}

export { testSockets };