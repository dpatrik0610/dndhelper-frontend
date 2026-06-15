import { useAiAssistantConfigStore } from "@store/useAiAssistantConfigStore";
import { useEffect, useRef, useState } from "react";

import { showNotification } from "@components/Notification/Notification";
import { cloneAssistantConfig } from "@features/aiAssistant/defaults";
import { sendAssistantMessage } from "@features/aiAssistant/services/geminiChatService";
import type { AssistantController } from "@features/aiAssistant/types/assistantController";
import type { AssistantConfig, AssistantMessage } from "@features/aiAssistant/types";
import { useIsMobile } from "@hooks/useIsMobile";

function createMessage(
  role: AssistantMessage["role"],
  text: string,
  isPending = false
): AssistantMessage {
  return { id: crypto.randomUUID(), role, text, isPending };
}

function getChatKey(topicId: string, modelId: string) {
  return `${topicId}::${modelId}`;
}

export function useAiAssistantController(): AssistantController {
  const config = useAiAssistantConfigStore((s) => s.config);
  const setConfig = useAiAssistantConfigStore((s) => s.setConfig);
  const resetConfig = useAiAssistantConfigStore((s) => s.resetConfig);

  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [activeTopicId, setActiveTopicId] = useState(config.topics[0]?.id ?? "");
  const [activeModelId] = useState(config.defaultModelId);

  const [messageInput, setMessageInput] = useState("");
  const [chatHistories, setChatHistories] = useState<Record<string, AssistantMessage[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [draftConfig, setDraftConfig] = useState<AssistantConfig>(() =>
    cloneAssistantConfig(config)
  );

  const activeTopic =
    config.topics.find((t) => t.id === activeTopicId) ??
    config.topics[0] ??
    null;

  const resolvedModelId =
    config.models.find((m) => m.id === activeModelId)?.id ??
    config.defaultModelId;

  const chatKey = activeTopic ? getChatKey(activeTopic.id, resolvedModelId) : "";
  const activeMessages = chatKey ? chatHistories[chatKey] ?? [] : [];

  useEffect(() => {
    setDraftConfig(cloneAssistantConfig(config));
  }, [config]);

  function setMessages(update: AssistantMessage[] | ((c: AssistantMessage[]) => AssistantMessage[])) {
    if (!chatKey) return;

    setChatHistories((prev) => {
      const current = prev[chatKey] ?? [];
      const next = typeof update === "function" ? update(current) : update;
      return { ...prev, [chatKey]: next };
    });
  }

  async function send() {
    if (!activeTopic || !messageInput.trim() || isSending) return;

    const prompt = messageInput.trim();
    const userMsg = createMessage("user", prompt);
    const pending = createMessage("model", "", true);

    setMessageInput("");
    setMessages((c) => [...c, userMsg, pending]);
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const text = await sendAssistantMessage({
        modelId: resolvedModelId,
        systemPrompt: activeTopic.systemPrompt,
        history: activeMessages,
        message: prompt,
        signal: controller.signal,
      });

      setMessages((c) =>
        c.map((m) =>
          m.id === pending.id ? { ...m, text, isPending: false } : m
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";

      setMessages((c) =>
        c.map((m) =>
          m.id === pending.id ? { ...m, text: msg, isPending: false } : m
        )
      );

      showNotification({
        title: "Error",
        message: msg,
        color: "red",
      });
    } finally {
      abortRef.current = null;
      setIsSending(false);
    }
  }

  function clear() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsSending(false);
  }

  function abort() {
    abortRef.current?.abort();
  }

  function save() {
    setConfig(draftConfig);
    showNotification({
      title: "Saved",
      message: "Assistant updated",
      color: "green",
    });
  }


  function downloadChat() {
    if (!chatKey) return;

    const messages = chatHistories[chatKey] ?? [];

    const payload = {
      topic: activeTopic?.name ?? "chat",
      model: resolvedModelId,
      exportedAt: new Date().toISOString(),
      messages: messages.map((m) => ({
        role: m.role,
        text: m.text,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${activeTopic?.id ?? "session"}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  return {
    config,
    draftConfig,
    activeMessages,
    activeTopic,

    messageInput,
    isSending,
    settingsOpen,
    isMobile,

    setDraftConfig,
    setMessageInput,
    setActiveTopicId,
    setSettingsOpen,

    send,
    clear,
    abort,
    save,
    resetConfig,

    downloadChat,

    messagesEndRef,
  };
}