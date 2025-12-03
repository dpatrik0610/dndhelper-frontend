import {
  Children,
  Fragment,
  type ReactNode,
  type CSSProperties,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Anchor,
  Badge,
  Blockquote,
  Code,
  Divider,
  List,
  Table,
  Text,
} from "@mantine/core";

interface MarkdownRendererProps {
  content: string;
  highlightQuery?: string;
  className?: string;
  style?: CSSProperties;
  textColor?: string;
}

// --- Config / constants ---

const HASHTAG_REGEX = /#[a-zA-Z0-9_-]+/g;

const WRAPPER_STYLE: CSSProperties = {
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  fontFamily:
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const PARAGRAPH_STYLE: CSSProperties = {
  marginTop: 0,
  marginBottom: 4,
  padding: "0 4px",
  lineHeight: 1.5,
  fontSize: 20,
  textAlign: "justify",
  textJustify: "inter-word"
};

const HEADING_BASE_STYLE: CSSProperties = {
  marginTop: 8,
  marginBottom: 4,
  lineHeight: 1.1,
};

const LIST_STYLE: CSSProperties = {
  paddingLeft: "1.1rem",
  marginTop: 2,
  marginBottom: 4,
};

const BLOCKQUOTE_STYLE: CSSProperties = {
  marginTop: 6,
  marginBottom: 6,
};

const TABLE_STYLE: CSSProperties = {
  marginTop: 6,
  marginBottom: 6,
};

const TABLE_HEADER_CELL_STYLE: CSSProperties = {
  textAlign: "left",
  padding: "4px 6px",
  fontWeight: 600,
};

const TABLE_CELL_STYLE: CSSProperties = {
  textAlign: "left",
  padding: "4px 6px",
};

const HIGHLIGHT_STYLE: CSSProperties = {
  background: "rgba(255, 230, 230, 0.35)",
  color: "white",
  padding: "0 2px",
  borderRadius: 3,
  textShadow: "0 0 6px rgba(255, 150, 150, 0.9)",
};

const MARK_HIGHLIGHT_STYLE: CSSProperties = {
  background: "rgba(255, 200, 120, 0.18)",
  color: "#ffe9c4",
  padding: "0 2px",
  borderRadius: 3,
  textShadow: "0 0 6px rgba(255, 200, 120, 0.9)", // warm glow
};

const TAG_BADGE_STYLE = {
  root: {
    background:
      "linear-gradient(135deg, rgba(255,80,80,0.45), rgba(255,140,140,0.25))",
    border: "1px solid rgba(255,140,140,0.5)",
    color: "rgba(255,240,240,0.95)",
    boxShadow: "0 0 6px rgba(255,120,120,0.3)",
    backdropFilter: "blur(4px)",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    paddingLeft: 8,
    paddingRight: 8,
    marginRight: 4,
  },
};

// --- Helpers ---

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderTextSegments = (text: string, query?: string): ReactNode[] => {
  const escapedQuery = query ? escapeRegex(query) : "";
  const queryRegex = query ? new RegExp(`(${escapedQuery})`, "gi") : null;
  const queryLower = query?.toLowerCase();

  return text.split(/(#[a-zA-Z0-9_-]+)/g).map((segment, idx) => {
    const isTag = HASHTAG_REGEX.test(segment);

    if (isTag) {
      const tagLabel = segment.replace("#", "");
      return (
        <Badge
          key={`tag-${segment}-${idx}`}
          variant="dot"
          size="sm"
          styles={TAG_BADGE_STYLE}
        >
          {tagLabel}
        </Badge>
      );
    }

    if (!queryRegex) {
      return (
        <Fragment key={`text-${segment}-${idx}`}>{segment}</Fragment>
      );
    }

    return segment.split(queryRegex).map((part, innerIndex) => {
      const isMatch = queryLower && part.toLowerCase() === queryLower;

      if (isMatch) {
        return (
          <Text
            key={`highlight-${part}-${idx}-${innerIndex}`}
            span
            style={HIGHLIGHT_STYLE}
          >
            {part}
          </Text>
        );
      }

      return (
        <Fragment key={`text-${part}-${idx}-${innerIndex}`}>
          {part}
        </Fragment>
      );
    });
  });
};

const transformChildren = (
  children: ReactNode,
  query?: string
): ReactNode =>
  Children.map(children, (child) => {
    if (typeof child === "string") {
      return renderTextSegments(child, query);
    }
    return child;
  });

// --- Component ---

export function MarkdownRenderer({
  content,
  highlightQuery,
  className,
  style,
  textColor,
}: MarkdownRendererProps) {
  return (
    <div
      className={className}
      style={{ ...WRAPPER_STYLE, ...style }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children, ...props }) => (
            <div style={PARAGRAPH_STYLE} {...props}>
              <Text
                span
                size="sm"
                c={textColor ?? "gray.2"}
                style={{ lineHeight: PARAGRAPH_STYLE.lineHeight }}
              >
                {transformChildren(children, highlightQuery)}
              </Text>
            </div>
          ),

          h1: ({ children, ...props }) => (
            <Text
              component="h1"
              size="lg"
              fw={800}
              tt="uppercase"
              style={HEADING_BASE_STYLE}
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
              style={HEADING_BASE_STYLE}
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
              style={HEADING_BASE_STYLE}
              {...props}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),

          // unordered
          ul: ({ children, ...props }) => (
            <List
              size="sm"
              styles={{ root: { margin: 0, paddingLeft: "1rem" } }}
              {...props}
            >
              {children}
            </List>
          ),

          // ordered
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ol: ({ children, type: _ignored, ...props }) => (
            <List
              type="ordered"
              size="sm"
              styles={{ root: { margin: 0, paddingLeft: "1rem" } }}
              {...props}
            >
              {children}
            </List>
          ),

          li: ({ children }) => <List.Item>{children}</List.Item>,
          
          a: ({ href, children, ...props }) => (
            <Anchor
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              {...props}
            >
              {children}
            </Anchor>
          ),

          code: (props) => {
            const { inline, children } = props as {
              inline?: boolean;
              children?: ReactNode;
            };

            if (inline) {
              return (
                <Code component="span" fz="xs">
                  {children}
                </Code>
              );
            }

            return (
              <Code
                block
                fz="xs"
                maw="100%"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {children}
              </Code>
            );
          },

          blockquote: ({ children, ...props }) => (
            <Blockquote
              color="red"
              style={BLOCKQUOTE_STYLE}
              {...props}
            >
              {children}
            </Blockquote>
          ),

          mark: ({ children }) => (
            <Text
              component="mark"
              span
              style={MARK_HIGHLIGHT_STYLE}
            >
              {children}
            </Text>
          ),

          hr: (props) => (
            <Divider
              my={6}
              {...props}
            />
          ),

          table: (props) => (
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              style={TABLE_STYLE}
              {...props}
            />
          ),
          th: (props) => (
            <Table.Th
              style={TABLE_HEADER_CELL_STYLE}
              {...props}
            />
          ),
          td: (props) => (
            <Table.Td
              style={TABLE_CELL_STYLE}
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
