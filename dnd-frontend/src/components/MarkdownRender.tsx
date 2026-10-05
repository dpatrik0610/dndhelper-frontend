import {
  Children,
  Fragment,
  type ReactNode,
  type CSSProperties,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { IconChevronRight } from "@tabler/icons-react";
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
import "katex/dist/katex.min.css";
import { hasRenderableContent, normalizeQuoteBlocks } from "@utils/markdown";

interface MarkdownRendererProps {
  content: string;
  highlightQuery?: string;
  className?: string;
  style?: CSSProperties;
  textColor?: string;
}

// --- Config / constants ---

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


const BLOCKQUOTE_STYLE: CSSProperties = {
  marginTop: 8,
  marginBottom: 8,
  borderLeft: "3px solid rgba(255, 200, 150, 0.6)",
  background: "linear-gradient(135deg, rgba(255,230,200,0.06), rgba(255,180,140,0.06))",
  padding: "8px 12px",
  color: "#ffe9c4",
  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
};

// Wide tables scroll sideways instead of squeezing their columns.
const TABLE_SCROLL_STYLE: CSSProperties = {
  overflowX: "auto",
  marginTop: 6,
  marginBottom: 6,
};

// Undo the wrapper's `overflowWrap: anywhere`, which broke squeezed cells letter by letter.
const TABLE_STYLE: CSSProperties = {
  wordBreak: "normal",
  overflowWrap: "normal",
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

const MARK_HIGHLIGHT_STYLE: CSSProperties = {
  background: "rgba(255, 200, 120, 0.18)",
  color: "#ffe9c4",
  padding: "0 2px",
  borderRadius: 3,
  textShadow: "0 0 6px rgba(255, 200, 120, 0.9)", // warm glow
};

const HASHTAG_REGEX = /#[a-zA-Z0-9_-]+/g;

const HIGHLIGHT_STYLE: CSSProperties = {
  background: "rgba(255, 230, 230, 0.35)",
  color: "white",
  padding: "0 2px",
  borderRadius: 3,
  textShadow: "0 0 6px rgba(255, 150, 150, 0.9)",
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

type HastNode = { type: string; value?: string; children?: HastNode[] };

const hastText = (node?: HastNode): string =>
  node?.type === "text" ? node.value ?? "" : (node?.children ?? []).map(hastText).join("");

/** react-markdown passes every component its hast `node`; spread onto an element it renders as node="[object Object]". */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withoutNode = <T extends { node?: unknown }>({ node: _node, ...rest }: T) => rest;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\\]\\/g, "\\$&");

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
  const normalizedContent = normalizeQuoteBlocks(content);

  return (
    <div
      className={className}
      style={{ ...WRAPPER_STYLE, ...style }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children, ...props }) => (
            <div style={PARAGRAPH_STYLE} {...withoutNode(props)}>
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
              {...withoutNode(props)}
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
              {...withoutNode(props)}
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
              {...withoutNode(props)}
            >
              {transformChildren(children, highlightQuery)}
            </Text>
          ),

          // unordered
          ul: ({ children, ...props }) => (
            <List
              size="sm"
              styles={{ root: { margin: 0, paddingLeft: "1rem" } }}
              {...withoutNode(props)}
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
              {...withoutNode(props)}
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
              {...withoutNode(props)}
            >
              {children}
            </Anchor>
          ),

          // react-markdown v10 has no `inline` flag. Code blocks arrive wrapped in <pre>, which renders the whole block
          // from its source text, so `code` only ever renders inline code.
          pre: ({ node }) => (
            <Code
              block
              fz="xs"
              maw="100%"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {hastText(node).replace(/\n$/, "")}
            </Code>
          ),

          code: ({ children }) => (
            <Code component="span" fz="xs">
              {children}
            </Code>
          ),

          blockquote: ({ children, ...props }) =>
            hasRenderableContent(children) ? (
              <Blockquote
                color="orange"
                icon={<IconChevronRight size={16} stroke={1.8} />}
                iconSize={18}
                style={BLOCKQUOTE_STYLE}
                styles={{
                  root: { gap: 8, fontSize: 18, lineHeight: 1.5, paddingTop: 2 },
                  icon: { marginTop: 2 },
                }}
                {...withoutNode(props)}
              >
                {children}
              </Blockquote>
            ) : null,

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
              {...withoutNode(props)}
            />
          ),

          table: (props) => (
            <div style={TABLE_SCROLL_STYLE}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                style={TABLE_STYLE}
                {...withoutNode(props)}
              />
            </div>
          ),
          // Mantine's stripes and hover hang off its own row classes, so the sections and rows need its parts too.
          thead: (props) => <Table.Thead {...withoutNode(props)} />,
          tbody: (props) => <Table.Tbody {...withoutNode(props)} />,
          tr: (props) => <Table.Tr {...withoutNode(props)} />,
          // `style` carries the column alignment (:---:), merged so it doesn't wipe the padding.
          th: ({ style, ...props }) => (
            <Table.Th
              {...withoutNode(props)}
              style={{ ...TABLE_HEADER_CELL_STYLE, ...style }}
            />
          ),
          td: ({ style, ...props }) => (
            <Table.Td
              {...withoutNode(props)}
              style={{ ...TABLE_CELL_STYLE, ...style }}
            />
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
