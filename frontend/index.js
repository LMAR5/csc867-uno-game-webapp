import { Socket, io } from "socket.io-client";
 
import handlers from "./event-handlers";
import messageHandlers from "./messages";

// Provides us with type information on the io object
// declare global {
//   interface Window {
//     socket: Socket;
//   }
// }

//window.socket = io();
const socket = io();

// For Server-Side Rendering
let currentRoomId = 'lobby'; // default room

socket.on('joined_game', (roomId) => {
    currentRoomId = roomId;
    roomIdElement.textContent = 'Current room: ' + roomId;
  });
  
  socket.on('left_game', (roomId) => {
    currentRoomId = roomId;
    roomIdElement.textContent = 'Current room: ' + roomId;
  });

handlers.forEach((handler) => handler());
//messageHandlers.forEach((handler) => handler(window.socket));
messageHandlers.forEach((handler) => handler(socket));
