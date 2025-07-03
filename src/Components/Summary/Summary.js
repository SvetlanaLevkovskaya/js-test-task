import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { generateSummary } from "../../openai";

const Container = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 16px;
  font-weight: 600;
`;

const Text = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 4px solid #e0e0e0;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: ${spin} 1s linear infinite;
  margin: 8px auto;
`;

function getCurrentChatId() {
  const chatContainer = document.querySelector('[class*="chat-body"]');
  if (chatContainer) {
    return chatContainer.dataset.chatId || chatContainer.innerHTML.length;
  }
  const bubbles = document.querySelectorAll('.bubble');
  if (bubbles.length > 0) return bubbles.length;
  return window.location.pathname;
}

export const Summary = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatIdRef = useRef("");
  const loadingRef = useRef(false);

  async function fetchSummary() {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");
    setSummary("");

    try {
      const rawMessages = await window.getChatMessages?.();
      const messages = rawMessages?.length ? rawMessages : ["Привет!", "Как дела?", "Потом обсудим проект."];
      const result = await generateSummary(messages);
      setSummary(result);
    } catch {
      setError("Ошибка при генерации");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  useEffect(() => {
    chatIdRef.current = getCurrentChatId();
    fetchSummary();

    const observer = new MutationObserver(() => {
      const newId = getCurrentChatId();
      if (newId !== chatIdRef.current) {
        chatIdRef.current = newId;
        fetchSummary();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const urlCheck = setInterval(() => {
      const newId = getCurrentChatId();
      if (newId !== chatIdRef.current) {
        chatIdRef.current = newId;
        fetchSummary();
      }
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(urlCheck);
    };
  }, []);

  return (
    <Container>
      <SummaryTitle>Резюме</SummaryTitle>
      {loading ? (
        <>
          <Spinner />
          <Text>⏳ Анализ чата...</Text>
        </>
      ) : error ? (
        <Text>⚠️ {error}</Text>
      ) : (
        <Text>{summary}</Text>
      )}
    </Container>
  );
};
