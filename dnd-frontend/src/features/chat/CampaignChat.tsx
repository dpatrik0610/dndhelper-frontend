import { useEffect } from "react";
import { Center, Loader, Text } from "@mantine/core";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useChatStore } from "@store/chat/chatStore";
import { chat } from "./chatHub";
import { ChatView, type WhisperTarget } from "./ChatView";

/**
 * The open campaign chat (useChatHub picks which). Players speak as `characterId` when it's theirs, else their first
 * character in the campaign; the DM speaks as themselves. Being on screen marks the chat read.
 */
export function CampaignChat({ characterId }: { characterId?: string | null }) {
  const me = useCurrentUserId();
  const room = useChatStore((s) => s.room);
  const messages = useChatStore((s) => s.messages);
  const hasMore = useChatStore((s) => s.hasMore);
  const error = useChatStore((s) => s.error);

  useEffect(() => {
    const store = useChatStore.getState;
    store().set({ viewers: store().viewers + 1, unread: false });
    return () => store().set({ viewers: Math.max(0, store().viewers - 1) });
  }, []);

  if (error)
    return (
      <Center className="chat-view" p="md">
        <Text size="sm" c="dimmed" ta="center">
          {error}
        </Text>
      </Center>
    );
  if (!room)
    return (
      <Center className="chat-view">
        <Loader size="sm" />
      </Center>
    );

  const speaker = room.isDm ? null : (room.characters.find((c) => c.id === characterId) ?? room.characters[0] ?? null);
  const whisperTargets: WhisperTarget[] = room.isDm
    ? room.whisperTargets.map((t) => ({ characterId: t.characterId, label: t.name, avatar: room.avatars?.[t.characterId] }))
    : [{ characterId: null, label: "the DM" }];

  return (
    <ChatView
      messages={messages}
      hasMore={hasMore}
      speaker={room.isDm ? "the DM" : (speaker?.name ?? "yourself")}
      whisperTargets={whisperTargets}
      canEdit={(m) => m.userId === me}
      canDelete={(m) => m.userId === me || room.isDm}
      onSend={(text, target) =>
        chat.send({ text, characterId: speaker?.id ?? null, whisper: !!target, toCharacterId: target?.characterId ?? null })
      }
      avatarOf={(m) => (m.characterId ? room.avatars?.[m.characterId] : undefined)}
      onEdit={chat.edit}
      onDelete={(id) => void chat.remove(id)}
      onLoadMore={async () => {
        // Read at click time: a captured messages[0].id becomes a render-time memo dependency
        // under the React Compiler, which throws while the chat is still empty.
        const oldest = useChatStore.getState().messages[0];
        if (!oldest) return;
        const page = await chat.history(oldest.id);
        if (page) useChatStore.getState().prepend(page.messages, page.hasMore);
      }}
    />
  );
}
