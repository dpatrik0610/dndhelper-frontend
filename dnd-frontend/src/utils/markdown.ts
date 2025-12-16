import { Children, isValidElement, type ReactNode } from "react";

export const normalizeQuoteBlocks = (input: string): string => {
  const lines = input.split(/\r?\n/);
  const result: string[] = [];
  let current: string[] = [];

  const flushQuote = () => {
    if (!current.length) return;
    result.push(current.join("\n"));
    current = [];
  };

  for (const raw of lines) {
    const match = raw.match(/^\s*>(.*)$/);
    if (match) {
      const content = match[1] ?? "";
      const cleaned = content.replace(/^\s/, ""); // drop a single leading space after >
      current.push(`> ${cleaned}`);
      continue;
    }

    // Allow blank lines to stay inside a running blockquote
    if (current.length && raw.trim() === "") {
      current.push(">");
      continue;
    }

    // Non-quote line ends the current blockquote run
    flushQuote();
    result.push(raw);
  }

  flushQuote();
  return result.join("\n");
};

export const hasRenderableContent = (node: ReactNode): boolean =>
  Children.toArray(node).some((child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return false;
    }
    if (typeof child === "string" || typeof child === "number") {
      return String(child).trim().length > 0;
    }
    if (Array.isArray(child)) {
      return hasRenderableContent(child as unknown as ReactNode);
    }
    if (isValidElement(child)) {
      const childProps = (child.props ?? {}) as { children?: ReactNode };
      return hasRenderableContent(childProps.children);
    }
    return false;
  });
