import { Socket, io } from "socket.io-client";

import handlers from "./event-handlers";
import messageHandlers from "./messages";
import gameHandlers from "./games";

// Provides us with type information on the io object
// declare global {
//   interface Window {
//     socket: Socket;
//   }

// }

//window.socket = io();
const socket = io();
/*
// Server-Side Rendering
let currentRoomId = 'lobby'; // default room

// Checks if the element exists
const roomIdElement = document.querySelector('#room-id');

socket.on('connect', () => {
    console.log('Connected to server');

    socket.emit('joinLobby');

    socket.on('joined_lobby', (roomId) => {
        currentRoomId = roomId;
        if (roomIdElement) {
            roomIdElement.textContent = 'Current room: ' + roomId;
        }
        console.log(`Joined lobby: ${roomId}`);
    });

    socket.on('left_lobby', (roomId) => {
        if (currentRoomId === roomId) {
            currentRoomId = undefined;
            console.log(`Left lobby: ${roomId}`);
        }
    });

    socket.on('joined_game', (roomId) => {
        currentRoomId = roomId;
        if (roomIdElement) {
            roomIdElement.textContent = 'Current room: ' + roomId;
        }
        console.log(`Joined game: ${roomId}`);
    });

    socket.on('left_game', (roomId) => {
        if (currentRoomId === roomId) {
            currentRoomId = 'lobby';
            if (roomIdElement) {
                roomIdElement.textContent = 'Current room: ' + roomId;
            }
            console.log(`Left game: ${roomId}`);
        }
    });
*/

// Ensuring that the socket is connected to the correct room
//messageHandlers.forEach((handler) => handler(socket, () => currentRoomId));
handlers.forEach((handler) => handler());
gameHandlers.forEach((handler) => handler());
//messageHandlers.forEach((handler) => handler(window.socket));
messageHandlers.forEach((handler) => handler(socket));
//});
