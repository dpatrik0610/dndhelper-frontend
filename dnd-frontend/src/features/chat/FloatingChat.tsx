import { useEffect, useRef, useState } from "react";
import { ActionIcon, Select, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconMessageCircle, IconX } from "@tabler/icons-react";
import { useChatStore } from "@store/chat/chatStore";
import { useChatHub } from "./chatHub";
import { CampaignChat } from "./CampaignChat";
import "./chat.css";

const PICKED_KEY = "chatCampaign";
/** Matches the chat-float-out animation; on a timer so it also closes when animations are off. */
const CLOSE_MS = 150;

const readPicked = () => {
  try {
    return localStorage.getItem(PICKED_KEY);
  } catch {
    return null;
  }
};

/**
 * Campaign chat in a bubble at the bottom right, for every page but the tabletop (which has its own Chat tab).
 * Full screen on phones. Hidden while the user has no campaign to chat in.
 */
export function FloatingChat() {
  const campaigns = useChatStore((s) => s.campaigns);
  const unread = useChatStore((s) => s.unread);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [picked, setPicked] = useState(readPicked);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Plays the way out before unmounting; opening again mid-way just cancels it.
  const close = () => {
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, CLOSE_MS);
  };
  const show = () => {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  };
  const shown = open && !closing;

  // The remembered campaign while it's still one of theirs, else the first.
  const campaignId = campaigns?.find((c) => c.id === picked)?.id ?? campaigns?.[0]?.id ?? null;
  useChatHub(campaignId);

  if (!campaigns?.length) return null;

  const pick = (id: string | null) => {
    if (!id) return;
    setPicked(id);
    try {
      localStorage.setItem(PICKED_KEY, id);
    } catch {
      // Remembering the pick is a nicety.
    }
  };

  return (
    <>
      {open && (
        <section className={`chat-float${closing ? " closing" : ""}`} role="dialog" aria-label="Campaign chat">
          <header className="chat-float-head">
            <IconMessageCircle size={15} />
            {campaigns.length > 1 ? (
              <Select
                size="xs"
                variant="unstyled"
                aria-label="Campaign"
                data={campaigns.map((c) => ({ value: c.id, label: c.name }))}
                value={campaignId}
                onChange={pick}
                allowDeselect={false}
                comboboxProps={{ withinPortal: true }}
                styles={{ input: { fontWeight: 700, fontSize: "var(--mantine-font-size-sm)", height: 26, minHeight: 26, lineHeight: "26px" } }}
                style={{ flex: 1, minWidth: 0 }}
              />
            ) : (
              <Text fw={700} size="sm" truncate style={{ flex: 1 }}>
                {campaigns[0].name}
              </Text>
            )}
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={close} aria-label="Close chat">
              <IconX size={14} />
            </ActionIcon>
          </header>
          <CampaignChat />
        </section>
      )}

      <Tooltip label="Campaign chat" position="left" disabled={shown}>
        <UnstyledButton className="chat-fab" onClick={shown ? close : show} aria-label="Campaign chat" aria-expanded={shown}>
          {/* Keyed so each swap replays the turn-in. */}
          <span key={shown ? "close" : "chat"} className="chat-fab-icon">
            {shown ? <IconX size={22} /> : <IconMessageCircle size={24} />}
          </span>
          {unread && !shown && <span className="chat-fab-dot" aria-label="New messages" />}
        </UnstyledButton>
      </Tooltip>
    </>
  );
}
