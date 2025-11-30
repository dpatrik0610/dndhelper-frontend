import React, { Children } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Badge, Text, Table } from "@mantine/core";

interface MarkdownRendererProps {
  content: string;
  highlightQuery?: string;
}

const HASHTAG_REGEX = /#[a-zA-Z0-9_-]+/g;

const renderTextSegments = (text: string, query?: string) => {
  const escapedQuery = query ? query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : "";
  const queryRegex = query ? new RegExp(`(${escapedQuery})`, "gi") : null;
  const queryLower = query?.toLowerCase();

  return text.split(/(#[a-zA-Z0-9_-]+)/g).map((segment, idx) => {
    const isTag = Boolean(segment.match(HASHTAG_REGEX));
    if (isTag) {
      const tagLabel = segment.replace("#", "");
      return (
        <Badge
          key={`tag-${segment}-${idx}`}
          variant="dot"
          size="xs"
          styles={{
            root: {
              background:
                "linear-gradient(135deg, rgba(255,80,80,0.45), rgba(255,140,140,0.25))",
              border: "1px solid rgba(255,140,140,0.5)",
              color: "rgba(255,240,240,0.95)",
              boxShadow: "0 0 6px rgba(255,120,120,0.3)",
              backdropFilter: "blur(4px)",
              textTransform: "lowercase",
              letterSpacing: 0.3,
              paddingLeft: 8,
              paddingRight: 8,
              marginRight: 4,
            },
          }}
        >
          {tagLabel}
        </Badge>
      );
    }

    if (!queryRegex) {
      return <React.Fragment key={`text-${segment}-${idx}`}>{segment}</React.Fragment>;
    }

    return segment.split(queryRegex).map((part, innerIndex) => {
      const isMatch = queryLower && part.toLowerCase() === queryLower;
      if (isMatch) {
        return (
          <Text
            key={`highlight-${part}-${idx}-${innerIndex}`}
            span
            style={{
              background: "rgba(255, 230, 230, 0.35)",
              color: "white",
              padding: "0 2px",
              borderRadius: 3,
            }}
          >
            {part}
          </Text>
        );
      }

      return (
        <React.Fragment key={`text-${part}-${idx}-${innerIndex}`}>
          {part}
        </React.Fragment>
      );
    });
  });
};

const transformChildren = (
  children: React.ReactNode,
  query?: string
): React.ReactNode =>
  Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextSegments(child, query);
    }
    return child;
  });

export function MarkdownRenderer({ content, highlightQuery }: MarkdownRendererProps) {
  return (
    <div
      style={{
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        whiteSpace: "pre-wrap",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children, ...props }) => (
            <Text
              component="p"
              size="sm"
              c="gray.2"
              style={{ margin: 0, lineHeight: 1.4 }}
              {...props}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),
          h1: ({ children, ...props }) => (
            <Text
              component="h1"
              size="lg"
              fw={800}
              tt="uppercase"
              style={{ margin: "4px 0", lineHeight: 1.2 }}
              {...props}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),
          h2: ({ children, ...props }) => (
            <Text
              component="h2"
              size="md"
              fw={700}
              tt="uppercase"
              style={{ margin: "4px 0", lineHeight: 1.2 }}
              {...props}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),
          h3: ({ children, ...props }) => (
            <Text
              component="h3"
              size="sm"
              fw={700}
              tt="uppercase"
              style={{ margin: "4px 0", lineHeight: 1.2 }}
              {...props}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),
          ul: ({ ...props }) => (
            <ul
              style={{
                margin: "4px 0",
                paddingLeft: "1.2rem",
              }}
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              style={{
                margin: "4px 0",
                paddingLeft: "1.2rem",
              }}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li style={{ marginBottom: 2 }} {...props} />
          ),
          table: ({ ...props }) => (
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              style={{ margin: "8px 0" }}
              {...props}
            />
          ),
          th: ({ ...props }) => (
            <Table.Th
              style={{
                textAlign: "left",
              padding: "5px",
              fontWeight: 600,
            }}
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <Table.Td
              style={{
                textAlign: "left",
                padding: "5px",
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
