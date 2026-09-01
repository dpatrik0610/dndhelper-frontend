import { Card, Stack, Title, Text, Loader, Center } from "@mantine/core";
import ReactMarkdown from "react-markdown";
import type { Session } from "@appTypes/Session";
import { useSessionNotes } from "./ActiveSessionCard/useSessionNotes";

interface Props {
  session: Session;
}

export function ActiveSessionCard({ session }: Props) {
  const { notes, loading, error } = useSessionNotes(session.noteIds ?? []);

  const markdownContent = notes
    .map((note) => {
      const title = note.title ? `### ${note.title}\n\n` : "";
      const content = (note.lines ?? []).join("\n");
      return `${title}${content}`;
    })
    .join("\n\n");

  return (
    <PaperCardWrapper>
      <Card
        radius="lg"
        p="xl"
        withBorder
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          color: "var(--theme-color-text-primary, #fff)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        }}
      >
        <Stack gap="lg">
          <Title
            order={2}
            style={{
              color: "var(--theme-color-text-primary, #fff)",
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            {session.name}
          </Title>

          {loading && (
            <Center py="xl">
              <Loader size="sm" color="var(--theme-color-accent-primary)" />
            </Center>
          )}

          {error && (
            <Text size="sm" style={{ color: "var(--theme-color-accent-primary)", fontStyle: "italic" }}>
              Failed to retrieve session chronicles: {error}
            </Text>
          )}

          {!loading && !error && (
            <div style={{ color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.75))" }}>
              {markdownContent ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <Text
                        size="sm"
                        style={{
                          lineHeight: 1.6,
                          marginBottom: "14px",
                          color: "var(--theme-color-text-secondary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {children}
                      </Text>
                    ),
                    h1: ({ children }) => (
                      <Title
                        order={3}
                        style={{
                          color: "var(--theme-color-text-primary)",
                          marginTop: "20px",
                          marginBottom: "10px",
                          fontWeight: 800,
                        }}
                      >
                        {children}
                      </Title>
                    ),
                    h2: ({ children }) => (
                      <Title
                        order={4}
                        style={{
                          color: "var(--theme-color-text-primary)",
                          marginTop: "16px",
                          marginBottom: "8px",
                          fontWeight: 700,
                        }}
                      >
                        {children}
                      </Title>
                    ),
                    h3: ({ children }) => (
                      <Title
                        order={5}
                        style={{
                          color: "var(--theme-color-text-primary)",
                          marginTop: "12px",
                          marginBottom: "6px",
                          fontWeight: 700,
                        }}
                      >
                        {children}
                      </Title>
                    ),
                    li: ({ children }) => (
                      <li
                        style={{
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                          marginBottom: "6px",
                          color: "var(--theme-color-text-secondary)",
                        }}
                      >
                        {children}
                      </li>
                    ),
                    ul: ({ children }) => <ul style={{ paddingLeft: "20px", marginBottom: "14px" }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ paddingLeft: "20px", marginBottom: "14px" }}>{children}</ol>,
                  }}
                >
                  {markdownContent}
                </ReactMarkdown>
              ) : (
                <Text size="sm" style={{ fontStyle: "italic", color: "var(--theme-color-text-secondary)", opacity: 0.7 }}>
                  The chronicles of this session are empty.
                </Text>
              )}
            </div>
          )}
        </Stack>
      </Card>
    </PaperCardWrapper>
  );
}

function PaperCardWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
