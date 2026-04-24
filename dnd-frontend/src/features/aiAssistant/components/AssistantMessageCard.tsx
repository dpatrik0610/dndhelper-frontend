import { Box, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconSparkles, IconUser } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AssistantMessage } from "@features/aiAssistant/types";

interface AssistantMessageCardProps {
  message: AssistantMessage;
}

export function AssistantMessageCard({ message }: AssistantMessageCardProps) {
  const isModel = message.role === "model";

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{
        background: isModel ? "rgba(32, 24, 52, 0.72)" : "rgba(20, 18, 40, 0.48)",
        borderColor: isModel ? "rgba(177, 151, 252, 0.28)" : "rgba(255, 255, 255, 0.07)",
      }}
    >
      <Box style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <ThemeIcon
          size={34}
          radius="xl"
          variant={isModel ? "gradient" : "light"}
          gradient={isModel ? { from: "grape", to: "cyan" } : undefined}
          color={isModel ? undefined : "gray"}
        >
          {isModel ? <IconSparkles size={18} /> : <IconUser size={18} />}
        </ThemeIcon>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={700} c={isModel ? "grape.2" : "gray.3"} mb={6}>
            {isModel ? "Assistant" : "You"}
          </Text>
          <Box
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#f8f9fa",
              wordBreak: "break-word",
            }}
            className="ai-message"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <Text size="sm" mb="xs">{children}</Text>,
                li: ({ children }) => <li><Text span size="sm">{children}</Text></li>,
                code: ({ children }) => (
                  <code
                    style={{
                      background: "rgba(0,0,0,0.28)",
                      padding: "2px 6px",
                      borderRadius: 6,
                    }}
                  >
                    {children}
                  </code>
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </Box>
          {message.isPending && (
            <Text size="xs" c="dimmed" mt="xs">
              Thinking...
            </Text>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
