import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Text, Table } from "@mantine/core";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        p: (props) => (
          <Text
            size="sm"
            c="gray.2"
            style={{ margin: 0, lineHeight: 1.4 }}
            {...props}
          />
        ),
        h1: ({ ...props }) => (
          <Text
            component="h1"
            size="lg"
            fw={800}
            tt="uppercase"
            style={{ margin: "4px 0", lineHeight: 1.2 }}
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <Text
            component="h2"
            size="md"
            fw={700}
            tt="uppercase"
            style={{ margin: "4px 0", lineHeight: 1.2 }}
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <Text
            component="h3"
            size="sm"
            fw={700}
            tt="uppercase"
            style={{ margin: "4px 0", lineHeight: 1.2 }}
            {...props}
          />
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
  );
}
