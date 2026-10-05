import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";

/**
 * The emoji-picker-react panel, in its own module so the chat can lazy-load it on first open.
 * Native emoji: the system font draws them, so nothing is fetched from a CDN. Compact and themed in chat.css
 * (.chat-emoji-picker); keep the size in step with the loading placeholder in ChatView.
 */
export default function EmojiPickerPanel({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <EmojiPicker
      className="chat-emoji-picker"
      theme={Theme.DARK}
      emojiStyle={EmojiStyle.NATIVE}
      onEmojiClick={(e) => onPick(e.emoji)}
      width={296}
      height={320}
      lazyLoadEmojis
      skinTonesDisabled
      searchPlaceholder="Search emoji"
      previewConfig={{ showPreview: false }}
    />
  );
}
