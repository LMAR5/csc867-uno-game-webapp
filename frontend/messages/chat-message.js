import { format, render } from "timeago.js";

import { CHAT_MESSAGE, CHAT_MESSAGE_LOBBY } from "../../backend/sockets/constants";

const messageArea = document.querySelector("#chat-message-area-lobby"); // Lobby
const messageTemplate = document.querySelector("#chat-message-template"); // HTMLTemplateElement

export default function (socket) {
  socket.on(CHAT_MESSAGE_LOBBY, ({ roomId, message, senderEmail, gravatar, timestamp }) => {
    if (messageTemplate === null || messageArea === null) {
      console.error("Chat functionality not configured on this page");
      return;
    }
    const messageElement = messageTemplate.content.cloneNode(true); // as HTMLElement;

    const img = messageElement.querySelector("img");
    img.src = `https://gravatar.com/avatar/${gravatar}`;
    img.alt = `${senderEmail}'s gravatar`;

    const userName = messageElement.querySelector("span.chat-message-username"); // HTMLElement
    userName.textContent = senderEmail.substring(0, senderEmail.indexOf("@"));

    const timestampElement = messageElement.querySelector("time"); // HTMLTimeElement
    timestampElement.dateTime = timestamp.toString();
    render(timestampElement);

    const content = messageElement.querySelector(".chat-message-body"); // HTMLElement
    content.textContent = message;

    messageArea.insertBefore(messageElement, messageArea.firstChild);
    messageArea.scrollTop = messageArea.scrollHeight;
  });
}
