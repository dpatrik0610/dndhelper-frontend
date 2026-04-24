import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconMessageCircleBolt,
  IconPlus,
  IconRefresh,
  IconSend2,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { useAiAssistantConfigStore } from "@store/useAiAssistantConfigStore";
import { AssistantMessageCard } from "./components/AssistantMessageCard";
import { cloneAssistantConfig } from "./defaults";
import { sendAssistantMessage } from "./services/geminiChatService";
import type { AssistantConfig, AssistantMessage, AssistantTopic } from "./types";

function createMessage(role: AssistantMessage["role"], text: string, isPending = false): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    isPending,
  };
}

function getChatKey(topicId: string, modelId: string): string {
  return `${topicId}::${modelId}`;
}

export default function AiAssistantPage() {
  const config = useAiAssistantConfigStore((state) => state.config);
  const setConfig = useAiAssistantConfigStore((state) => state.setConfig);
  const resetConfig = useAiAssistantConfigStore((state) => state.resetConfig);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [activeTopicId, setActiveTopicId] = useState(config.topics[0]?.id ?? "");
  const [activeModelId, setActiveModelId] = useState(config.defaultModelId);
  const [messageInput, setMessageInput] = useState("");
  const [chatHistories, setChatHistories] = useState<Record<string, AssistantMessage[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<AssistantConfig>(() => cloneAssistantConfig(config));

  const activeTopic =
    config.topics.find((topic) => topic.id === activeTopicId) ??
    config.topics[0] ??
    null;

  const activeModelIdIsValid = config.models.some((model) => model.id === activeModelId);
  const resolvedModelId = activeModelIdIsValid
    ? activeModelId
    : config.models[0]?.id ?? config.defaultModelId;
  const activeChatKey = activeTopic ? getChatKey(activeTopic.id, resolvedModelId) : "";
  const activeMessages = activeChatKey ? chatHistories[activeChatKey] ?? [] : [];

  useEffect(() => {
    setDraftConfig(cloneAssistantConfig(config));
  }, [config]);

  useEffect(() => {
    if (!config.topics.length) {
      setActiveTopicId("");
      return;
    }

    if (!config.topics.some((topic) => topic.id === activeTopicId)) {
      setActiveTopicId(config.topics[0].id);
    }
  }, [activeTopicId, config.topics]);

  useEffect(() => {
    if (!config.models.length) {
      return;
    }

    if (!config.models.some((model) => model.id === activeModelId)) {
      setActiveModelId(
        config.models.some((model) => model.id === config.defaultModelId)
          ? config.defaultModelId
          : config.models[0].id
      );
    }
  }, [activeModelId, config.defaultModelId, config.models]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatKey, chatHistories]);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  function setMessagesForActiveChat(
    nextMessages: AssistantMessage[] | ((current: AssistantMessage[]) => AssistantMessage[])
  ) {
    if (!activeChatKey) {
      return;
    }

    setChatHistories((current) => {
      const existingMessages = current[activeChatKey] ?? [];
      const updatedMessages =
        typeof nextMessages === "function" ? nextMessages(existingMessages) : nextMessages;

      return {
        ...current,
        [activeChatKey]: updatedMessages,
      };
    });
  }

  function updateDraft(nextConfig: AssistantConfig) {
    setDraftConfig(nextConfig);
  }

  function handleSelectTopic(topic: AssistantTopic) {
    setActiveTopicId(topic.id);
  }

  function handleClearChat() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsSending(false);
    setMessagesForActiveChat([]);
  }

  function saveAssistantSettings() {
    const hasModels = draftConfig.models.some((model) => model.id.trim() && model.label.trim());
    const hasCategories = draftConfig.categories.some((category) => category.id.trim() && category.label.trim());
    const hasTopics = draftConfig.topics.some(
      (topic) => topic.id.trim() && topic.name.trim() && topic.categoryId.trim() && topic.systemPrompt.trim()
    );
    const defaultModelExists = draftConfig.models.some((model) => model.id === draftConfig.defaultModelId);
    const categoryIds = new Set(draftConfig.categories.map((category) => category.id));
    const topicsUseValidCategories = draftConfig.topics.every((topic) => categoryIds.has(topic.categoryId));

    if (!hasModels || !hasCategories || !hasTopics || !defaultModelExists || !topicsUseValidCategories) {
      showNotification({
        title: "Invalid Assistant Config",
        message: "Check models, default model, categories, and topic category assignments.",
        color: "yellow",
      });
      return;
    }

    setConfig(draftConfig);
    showNotification({
      title: "Saved",
      message: "AI assistant settings updated.",
      color: "green",
    });
  }

  async function handleSubmit() {
    if (!activeTopic || !messageInput.trim() || isSending) {
      return;
    }

    const prompt = messageInput.trim();
    const userMessage = createMessage("user", prompt);
    const pendingMessage = createMessage("model", "", true);

    setMessageInput("");
    setMessagesForActiveChat((current) => [...current, userMessage, pendingMessage]);
    setIsSending(true);

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const responseText = await sendAssistantMessage({
        modelId: resolvedModelId,
        systemPrompt: activeTopic.systemPrompt,
        history: activeMessages,
        message: prompt,
        signal: controller.signal,
      });

      setMessagesForActiveChat((current) =>
        current.map((message) =>
          message.id === pendingMessage.id
            ? { ...message, text: responseText, isPending: false }
            : message
        )
      );
    } catch (error) {
      const message =
        error instanceof Error && error.name === "AbortError"
          ? "Generation stopped."
          : error instanceof Error
            ? error.message
            : "The assistant request failed.";

      if (message !== "Generation stopped.") {
        showNotification({
          title: "Assistant Error",
          message,
          color: "red",
        });
      }

      setMessagesForActiveChat((current) =>
        current
          .map((item) =>
            item.id === pendingMessage.id
              ? { ...item, text: message, isPending: false }
              : item
          )
          .filter((item) => item.text.trim().length > 0 || item.role === "user")
      );
    } finally {
      abortControllerRef.current = null;
      setIsSending(false);
    }
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Box>
          <Title order={2}>AI Assistant</Title>
        </Box>

        <Group gap="xs">
          <Button
            variant="light"
            color="grape"
            rightSection={settingsOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            onClick={() => setSettingsOpen((current) => !current)}
          >
            Assistant Settings
          </Button>
          <Select
            data={config.models.map((model) => ({ value: model.id, label: model.label }))}
            value={resolvedModelId}
            onChange={(value) => {
              if (value) {
                setActiveModelId(value);
              }
            }}
            w={isMobile ? 180 : 240}
            size="sm"
            disabled={!config.models.length}
          />
          <Button
            variant="light"
            color="gray"
            leftSection={<IconRefresh size={16} />}
            onClick={handleClearChat}
            disabled={!activeTopic}
          >
            Clear
          </Button>
        </Group>
      </Group>

      <Collapse in={settingsOpen}>
        <Paper p="md" withBorder radius="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={600}>Assistant Configuration</Text>
                <Text c="dimmed" size="sm">
                  Edit models, categories, topics, and system prompts here.
                </Text>
              </div>
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="light"
                  color="yellow"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => {
                    resetConfig();
                    showNotification({
                      title: "Reset",
                      message: "AI assistant settings restored to defaults.",
                      color: "yellow",
                    });
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconDeviceFloppy size={14} />}
                  onClick={saveAssistantSettings}
                >
                  Save
                </Button>
              </Group>
            </Group>

            <Select
              label="Default Model"
              value={draftConfig.defaultModelId}
              data={draftConfig.models
                .filter((model) => model.id.trim().length > 0)
                .map((model) => ({
                  value: model.id,
                  label: model.label || model.id,
                }))}
              onChange={(value) => {
                if (value) {
                  updateDraft({
                    ...draftConfig,
                    defaultModelId: value,
                  });
                }
              }}
            />

            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text fw={600}>Models</Text>
                <ActionIcon
                  variant="light"
                  onClick={() =>
                    updateDraft({
                      ...draftConfig,
                      models: [...draftConfig.models, { id: "", label: "" }],
                    })
                  }
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>

              {draftConfig.models.map((model, index) => (
                <Grid key={`model-${index}`} gutter="sm" align="end">
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <TextInput
                      label="Model Id"
                      value={model.id}
                      onChange={(event) => {
                        const nextId = event.currentTarget.value;
                        const models = draftConfig.models.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, id: nextId } : item
                        );

                        updateDraft({
                          ...draftConfig,
                          models,
                          defaultModelId:
                            draftConfig.defaultModelId === model.id ? nextId : draftConfig.defaultModelId,
                        });
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Label"
                      value={model.label}
                      onChange={(event) =>
                        updateDraft({
                          ...draftConfig,
                          models: draftConfig.models.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.currentTarget.value } : item
                          ),
                        })
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 1 }}>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() =>
                        updateDraft({
                          ...draftConfig,
                          models: draftConfig.models.filter((_, itemIndex) => itemIndex !== index),
                          defaultModelId:
                            draftConfig.defaultModelId === model.id
                              ? draftConfig.models.find((_, itemIndex) => itemIndex !== index)?.id ?? ""
                              : draftConfig.defaultModelId,
                        })
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Grid.Col>
                </Grid>
              ))}
            </Stack>

            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text fw={600}>Categories</Text>
                <ActionIcon
                  variant="light"
                  onClick={() =>
                    updateDraft({
                      ...draftConfig,
                      categories: [...draftConfig.categories, { id: "", label: "" }],
                    })
                  }
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>

              {draftConfig.categories.map((category, index) => (
                <Grid key={`category-${index}`} gutter="sm" align="end">
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <TextInput
                      label="Category Id"
                      value={category.id}
                      onChange={(event) => {
                        const nextId = event.currentTarget.value;

                        updateDraft({
                          ...draftConfig,
                          categories: draftConfig.categories.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, id: nextId } : item
                          ),
                          topics: draftConfig.topics.map((topic) =>
                            topic.categoryId === category.id ? { ...topic, categoryId: nextId } : topic
                          ),
                        });
                      }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label="Label"
                      value={category.label}
                      onChange={(event) =>
                        updateDraft({
                          ...draftConfig,
                          categories: draftConfig.categories.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.currentTarget.value } : item
                          ),
                        })
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 1 }}>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => {
                        const nextCategories = draftConfig.categories.filter((_, itemIndex) => itemIndex !== index);
                        const fallbackCategoryId = nextCategories[0]?.id ?? "";

                        updateDraft({
                          ...draftConfig,
                          categories: nextCategories,
                          topics: draftConfig.topics.map((topic) =>
                            topic.categoryId === category.id
                              ? { ...topic, categoryId: fallbackCategoryId }
                              : topic
                          ),
                        });
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Grid.Col>
                </Grid>
              ))}
            </Stack>

            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text fw={600}>Topics</Text>
                <ActionIcon
                  variant="light"
                  onClick={() =>
                    updateDraft({
                      ...draftConfig,
                      topics: [
                        ...draftConfig.topics,
                        {
                          id: "",
                          name: "",
                          categoryId: draftConfig.categories[0]?.id ?? "",
                          systemPrompt: "",
                        },
                      ],
                    })
                  }
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Group>

              {draftConfig.topics.map((topic, index) => (
                <Paper key={`topic-${index}`} p="sm" radius="md" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text fw={600}>Topic {index + 1}</Text>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() =>
                          updateDraft({
                            ...draftConfig,
                            topics: draftConfig.topics.filter((_, itemIndex) => itemIndex !== index),
                          })
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>

                    <Grid gutter="sm">
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                          label="Topic Id"
                          value={topic.id}
                          onChange={(event) =>
                            updateDraft({
                              ...draftConfig,
                              topics: draftConfig.topics.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, id: event.currentTarget.value } : item
                              ),
                            })
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                          label="Name"
                          value={topic.name}
                          onChange={(event) =>
                            updateDraft({
                              ...draftConfig,
                              topics: draftConfig.topics.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, name: event.currentTarget.value } : item
                              ),
                            })
                          }
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}>
                        <Select
                          label="Category"
                          value={topic.categoryId}
                          data={draftConfig.categories.map((category) => ({
                            value: category.id,
                            label: category.label || category.id,
                          }))}
                          onChange={(value) =>
                            updateDraft({
                              ...draftConfig,
                              topics: draftConfig.topics.map((item, itemIndex) =>
                                itemIndex === index && value ? { ...item, categoryId: value } : item
                              ),
                            })
                          }
                        />
                      </Grid.Col>
                    </Grid>

                    <Textarea
                      label="System Prompt"
                      value={topic.systemPrompt}
                      minRows={4}
                      autosize
                      onChange={(event) =>
                        updateDraft({
                          ...draftConfig,
                          topics: draftConfig.topics.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, systemPrompt: event.currentTarget.value } : item
                          ),
                        })
                      }
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      {(!config.models.length || !config.topics.length) && (
        <Paper
          p="lg"
          radius="lg"
          withBorder
          style={{
            background: "rgba(20, 18, 40, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <Text c="dimmed">
            Add at least one model and one topic in the assistant settings above before using the chat.
          </Text>
        </Paper>
      )}

      <Grid gutter="md" align="stretch">
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Paper
            radius="lg"
            withBorder
            p="sm"
            style={{
              height: isMobile ? "auto" : "calc(100vh - 190px)",
              background: "rgba(20, 18, 40, 0.62)",
              borderColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <ScrollArea h={isMobile ? undefined : "100%"} scrollbarSize={6}>
              <Stack gap="md">
                {config.categories.map((category) => {
                  const topics = config.topics.filter((topic) => topic.categoryId === category.id);

                  if (!topics.length) {
                    return null;
                  }

                  return (
                    <Box key={category.id}>
                      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                        {category.label}
                      </Text>
                      <Stack gap={6}>
                        {topics.map((topic) => {
                          const isActive = topic.id === activeTopic?.id;

                          return (
                            <UnstyledButton
                              key={topic.id}
                              onClick={() => handleSelectTopic(topic)}
                              style={{
                                borderRadius: 12,
                                padding: "10px 12px",
                                border: `1px solid ${isActive ? "rgba(177, 151, 252, 0.35)" : "rgba(255,255,255,0.06)"}`,
                                background: isActive
                                  ? "linear-gradient(135deg, rgba(100, 65, 180, 0.72), rgba(38, 103, 168, 0.55))"
                                  : "rgba(255, 255, 255, 0.02)",
                              }}
                            >
                              <Group gap="sm" wrap="nowrap">
                                <IconMessageCircleBolt size={16} color={isActive ? "#f3e8ff" : "#b4b4c7"} />
                                <Text size="sm" fw={600}>
                                  {topic.name}
                                </Text>
                              </Group>
                            </UnstyledButton>
                          );
                        })}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Paper
            radius="lg"
            withBorder
            style={{
              minHeight: "calc(100vh - 190px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "rgba(20, 18, 40, 0.62)",
              borderColor: "rgba(255, 255, 255, 0.07)",
            }}
          >
            <Group justify="space-between" px="md" py="sm">
              <Box>
                <Text fw={700}>{activeTopic?.name ?? "No topic configured"}</Text>
                <Text size="xs" c="dimmed">
                  {config.categories.find((item) => item.id === activeTopic?.categoryId)?.label ?? "Uncategorized"}
                </Text>
              </Box>
              <Group gap={6}>
                {isSending && (
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => abortControllerRef.current?.abort()}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}
                <ActionIcon variant="light" color="grape">
                  <IconSparkles size={16} />
                </ActionIcon>
              </Group>
            </Group>

            <Divider color="rgba(255,255,255,0.08)" />
            <Box style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}>
              <ScrollArea
                style={{ flex: 1 }}
                scrollbarSize={6}
                p="md"
                offsetScrollbars
              >
                <Stack gap="sm">
                  {activeMessages.length === 0 ? (
                    <Paper
                      withBorder
                      radius="lg"
                      p="md"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <Text size="sm" c="dimmed">
                        Start a conversation.
                      </Text>
                    </Paper>
                  ) : (
                    activeMessages.map((message) => (
                      <AssistantMessageCard key={message.id} message={message} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </Stack>
              </ScrollArea>
            </Box>
            <Divider color="rgba(255,255,255,0.08)" />

            <Box p="md">
              <Group align="flex-end" gap="sm" wrap="nowrap">
                <Textarea
                  value={messageInput}
                  onChange={(event) => setMessageInput(event.currentTarget.value)}
                  placeholder={activeTopic ? `Ask about ${activeTopic.name.toLowerCase()}...` : "Ask something..."}
                  minRows={2}
                  maxRows={6}
                  autosize
                  style={{ flex: 1 }}
                  classNames={{input: "glassy-input", label: "glassy-label"}}
                  disabled={!activeTopic}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSubmit();
                    }
                  }}
                />
                <ActionIcon
                  size={48}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "grape", to: "cyan" }}
                  onClick={() => void handleSubmit()}
                  disabled={!messageInput.trim() || isSending || !activeTopic}
                >
                  <IconSend2 size={18} />
                </ActionIcon>
              </Group>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
