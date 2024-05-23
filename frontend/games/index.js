import {
  triggerDialog as createGameDialog,
  hiddeGameForm as createGameHideDialog,
} from "./create-game-dialog";
import { configure as configGameSocket } from "./game_socket";
import { checkButtonPlayerForm as btnPlay, configure as configUserSocket } from "./user_sockets";

const gameSocketId = document.querySelector("#game-socket-id");
const userSocketId = document.querySelector("#user-socket-id");
const lobbyUserSocketId = document.querySelector("#lobby-user-socket-id");
if (gameSocketId) {
  configGameSocket(gameSocketId.value);
}
if (userSocketId) {
  configUserSocket(userSocketId.value);
} else if (lobbyUserSocketId) {
  configUserSocket(lobbyUserSocketId.value);
}

const tabs = document.querySelectorAll("[data-tab-target]");
const activeClass = "bg-gray-200";

// Select first tab by default
if (tabs.length > 0) {
  tabs[0].classList.add(activeClass);
  document.querySelector("#tab1").classList.remove("hidden");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetContent = document.querySelector(tab.dataset.tabTarget);
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.add("hidden"));
      targetContent.classList.remove("hidden");

      // Remove active class from all tabs
      document
        .querySelectorAll(".bg-gray-200")
        .forEach((activeTab) => activeTab.classList.remove(activeClass));

      // Add active class to clicked tab
      tab.classList.add(activeClass);
    });
  });
}

export default [createGameDialog, createGameHideDialog, btnPlay];
