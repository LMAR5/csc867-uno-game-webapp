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

handlers.forEach((handler) => handler());
gameHandlers.forEach((handler) => handler());
//messageHandlers.forEach((handler) => handler(window.socket));
messageHandlers.forEach((handler) => handler(socket));
