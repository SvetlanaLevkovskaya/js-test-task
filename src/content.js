import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

function injectExtension() {
  if (document.getElementById("telegram-extension-root")) {
    return;
  }

  const extensionContainer = document.createElement("div");
  extensionContainer.id = "telegram-extension-root";
  extensionContainer.style.position = "fixed";
  extensionContainer.style.top = "20px";
  extensionContainer.style.right = "20px";
  extensionContainer.style.zIndex = "10000";
  extensionContainer.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  document.body.appendChild(extensionContainer);

  const root = ReactDOM.createRoot(extensionContainer);
  root.render(React.createElement(App));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectExtension);
} else {
  injectExtension();
}

export async function getChatMessages() {
  try {
    const bubbles = await new Promise((resolve, reject) => {
      const found = document.querySelectorAll('.bubble:not(.service)');
      if (found.length) {
        console.log('Сообщения найдены сразу:', found.length);
        return resolve(found);
      }

      const observer = new MutationObserver(() => {
        const bubbles = document.querySelectorAll('.bubble:not(.service)');
        console.log('🔍 MutationObserver: проверка...', bubbles.length);
        if (bubbles.length) {
          observer.disconnect();
          console.log('MutationObserver нашёл сообщения:', bubbles.length);
          resolve(bubbles);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      console.log('MutationObserver запущен');

      setTimeout(() => {
        observer.disconnect();
        const bubbles = document.querySelectorAll('.bubble:not(.service)');
        if (bubbles.length) {
          console.log('Таймаут, но сообщения появились:', bubbles.length);
          resolve(bubbles);
        } else {
          console.warn('Timeout waiting for messages');
          reject(new Error("Timeout waiting for messages"));
        }
      }, 7000);
    });

    const messages = [];

    bubbles.forEach(bubble => {
      const msg = bubble.querySelector('.translatable-message')?.textContent?.trim()
        || bubble.querySelector('.message')?.textContent?.replace(/\s+/g, ' ').trim();
      if (msg) messages.push(msg);
    });

    console.log('Итоговые сообщения:', messages);

    return messages.slice(-3);

  } catch (err) {
    console.error('Error extracting messages:', err);
    return ["Не удалось загрузить сообщения"];
  }
}

window.getChatMessages = getChatMessages;
