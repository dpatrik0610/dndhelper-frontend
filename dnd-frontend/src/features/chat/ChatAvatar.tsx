import { Avatar } from "@mantine/core";

/** First character of the name (emoji- and accent-safe), for avatars without a picture. */
const initial = (name: string) => [...name.trim()][0]?.toUpperCase() ?? "?";

/**
 * Tiny round avatar for the chat: the DM's is a 4-point star, everyone else's is their character's portrait,
 * or the first letter of the name when there's none. Colors follow the theme (chat.css).
 */
export function ChatAvatar({ name, src, dm = false, size = 18 }: { name: string; src?: string; dm?: boolean; size?: number }) {
  if (dm)
    return (
      <span className="chat-avatar dm" style={{ width: size, height: size }} aria-hidden>
        <svg viewBox="0 0 24 24">
          <path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" fill="currentColor" />
        </svg>
      </span>
    );
  return (
    <Avatar src={src || undefined} alt="" size={size} radius="xl" className="chat-avatar">
      {initial(name)}
    </Avatar>
  );
}
