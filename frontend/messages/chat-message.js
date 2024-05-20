//import { Socket } from "socket.io-client";
import { format, render } from "timeago.js";

import { CHAT_MESSAGE, CHAT_MESSAGE_LOBBY } from "../../backend/sockets/constants";

// export type ChatMessage = {
//   roomId: string;
//   message: string;
//   senderEmail: string;
//   gravatar: string;
//   timestamp: number;
// };

//const messageArea = document.querySelector<HTMLElement>("#chat-message-area");
//const messageTemplate = document.querySelector<HTMLTemplateElement>("#chat-message-template");
const messageArea = document.querySelector("#chat-message-area-lobby"); // Lobby
const messageTemplate = document.querySelector("#chat-message-template"); // HTMLTemplateElement

export default function (socket) {
  socket.on(CHAT_MESSAGE_LOBBY, ({ roomId, message, senderEmail, gravatar, timestamp }) => {
    if (messageTemplate === null || messageArea === null) {
      console.error("Chat functionality not configured on this page");
      return;
    }

    const messageElement = messageTemplate.content.cloneNode(true); // as HTMLElement;

    //const img = messageElement.querySelector<HTMLImageElement>("img"); // HTMLImageElement
    const img = messageElement.querySelector("img");
    img.src = `https://gravatar.com/avatar/${gravatar}`;
    img.alt = `${senderEmail}'s gravatar`;

    //const userName = messageElement.querySelector<HTMLElement>("span.chat-message-username");
    const userName = messageElement.querySelector("span.chat-message-username"); // HTMLElement
    userName.textContent = senderEmail.substring(0, senderEmail.indexOf("@"));

    //const timestampElement = messageElement.querySelector<HTMLTimeElement>("time");
    const timestampElement = messageElement.querySelector("time"); // HTMLTimeElement
    timestampElement.dateTime = timestamp.toString();
    render(timestampElement);

    //const content = messageElement.querySelector<HTMLElement>(".chat-message-body");
    const content = messageElement.querySelector(".chat-message-body"); // HTMLElement
    content.textContent = message;

    messageArea.insertBefore(messageElement, messageArea.firstChild);
    messageArea.scrollTop = messageArea.scrollHeight;
  });
}
