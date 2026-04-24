import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconDownload, IconRefresh, IconSend2, IconX } from "@tabler/icons-react";
import { AssistantMessageCard } from "./AssistantMessageCard";
import type { AssistantController } from "@features/aiAssistant/types/assistantController";
export function AssistantChat({
  controller,
}: {
  controller: AssistantController;
}) {
  const {
    activeMessages,
    messageInput,
    setMessageInput,
    send,
    isSending,
    activeTopic,
    messagesEndRef,
    clear,
    abort,
    downloadChat,
  } = controller;

  return (
    <Paper
      radius="lg"
      withBorder
      style={{
        height: "calc(100vh - 190px)", // ✅ fixed height instead of minHeight
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "rgba(20, 18, 40, 0.62)",
        borderColor: "rgba(255, 255, 255, 0.07)",
      }}
    >
      <Box
        px="md"
        pt="sm"
        pb={6}
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed" fw={600}>
            Chat Controls
          </Text>

          <Group gap="xs">
            {isSending && (
              <ActionIcon
                variant="light"
                color="red"
                onClick={abort}
                title="Stop generation"
              >
                <IconX size={16} />
              </ActionIcon>
            )}
            
             <ActionIcon variant="light" color="teal" onClick={downloadChat} title="Download chat">
              <IconDownload size={16} />
             </ActionIcon>

            <ActionIcon
              variant="light"
              color="gray"
              onClick={clear}
              title="Clear chat"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>
      
      <ScrollArea style={{ flex: 1 }} scrollbarSize={6} p="md" offsetScrollbars>
        <Stack gap="sm" style={{minHeight: "100%"}}>
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
            activeMessages.map((m: any) => (
              <AssistantMessageCard key={m.id} message={m} />
            ))
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </ScrollArea>

      <Divider color="rgba(255,255,255,0.08)" />

      <Box p="md">
        <Group align="flex-end" gap="sm" wrap="nowrap">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.currentTarget.value)}
            placeholder={
              activeTopic
                ? `Ask about ${activeTopic.name.toLowerCase()}...`
                : "Ask something..."
            }
            minRows={2}
            maxRows={6}
            autosize
            style={{ flex: 1 }}
            classNames={{
              input: "glassy-input",
              label: "glassy-label",
            }}
            disabled={!activeTopic}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />

          <ActionIcon
            size={48}
            radius="xl"
            variant="gradient"
            gradient={{ from: "grape", to: "cyan" }}
            onClick={send}
            disabled={!messageInput.trim() || isSending || !activeTopic}
          >
            <IconSend2 size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Paper>
  );
}