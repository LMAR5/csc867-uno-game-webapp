import { format, render } from "timeago.js";

const generateMsg = (message, senderEmail, gravatar, timestamp, messageAreaName) => {

    const messageArea = document.querySelector(messageAreaName); // HTMLElement
    const messageTemplate = document.querySelector("#chat-message-template"); // HTMLTemplateElement
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
}

export { generateMsg }