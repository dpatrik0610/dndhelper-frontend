import { useEffect, useState } from "react";
import { IconSend, IconTrash } from "@tabler/icons-react";
import type { ChronicleComment, ChronicleEntry } from "@appTypes/Chronicle";
import { GlassyTextarea } from "@components/common/GlassyTextarea";
import { showNotification } from "@components/Notification/Notification";
import {
  addComment,
  deleteComment,
  getComments,
} from "@services/chronicleService";
import { useAuthStore } from "@store/auth/authStore";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { timeAgo } from "@utils/timeAgo";
import { isShared } from "@features/chronicle/chronicleUtils";
import classes from "@features/chronicle/Chronicle.module.css";

const MAX_LENGTH = 4000;

/** Comment count goes to onCount so the rail tab can show it. */
export function DiscussionPanel({
  entry,
  isDm,
  onCount,
}: {
  entry: ChronicleEntry;
  isDm: boolean;
  onCount?: (n: number) => void;
}) {
  const myId = useAuthStore((s) => s.id);
  const tick = useChronicleStore((s) => s.commentTick[entry.id] ?? 0);
  const [comments, setComments] = useState<ChronicleComment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const shared = isShared(
    entry,
    useChronicleStore((s) => s.folders),
  );

  useEffect(() => {
    if (!shared) return;
    let stale = false;
    getComments(entry.id)
      .then((list) => !stale && setComments(list ?? []))
      .catch(() => !stale && setComments([]));
    return () => {
      stale = true;
    };
  }, [entry.id, shared, tick]);

  useEffect(
    () => onCount?.(shared ? comments.length : 0),
    [comments.length, shared, onCount],
  );

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      const created = await addComment(entry.id, body);
      setComments((list) =>
        list.some((c) => c.id === created.id) ? list : [...list, created],
      );
      setText("");
    } catch (error) {
      showNotification({
        title: "Comment not sent",
        message: (error as Error).message,
        color: "red",
      });
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment: ChronicleComment) => {
    try {
      await deleteComment(entry.id, comment.id);
      setComments((list) => list.filter((c) => c.id !== comment.id));
    } catch (error) {
      showNotification({
        title: "Could not delete",
        message: (error as Error).message,
        color: "red",
      });
    }
  };

  if (!shared)
    return (
      <p className={classes.railNote}>
        Only DMs can read this entry. Share it with players to open a discussion
        under it.
      </p>
    );

  return (
    <section aria-label="Discussion">
      <div className={classes.comments}>
        {comments.length === 0 && (
          <p className={classes.railNote}>
            No comments yet. Questions and theories about this entry go here.
          </p>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            className={classes.comment}
            data-dm={c.isDm || undefined}
          >
            <div className={classes.commentHead}>
              <strong>{c.username}</strong>
              {c.isDm && <span className={classes.commentRole}>DM</span>}
              <span className={classes.faint}>
                {c.createdAt ? timeAgo(c.createdAt) : ""}
              </span>
              {(isDm || c.userId === myId) && (
                <button
                  type="button"
                  className={classes.iconButton}
                  style={{ marginLeft: "auto", width: 22, height: 22 }}
                  onClick={() => void remove(c)}
                  aria-label="Delete comment"
                  title="Delete comment"
                >
                  <IconTrash size={12} />
                </button>
              )}
            </div>
            <p className={classes.commentText}>{c.text}</p>
          </div>
        ))}
      </div>

      <GlassyTextarea
        placeholder="Write a comment"
        aria-label="Write a comment"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void send();
        }}
        autosize
        minRows={2}
        maxRows={6}
        maxLength={MAX_LENGTH}
      />
      <button
        type="button"
        className={`glass-btn-primary ${classes.button}`}
        style={{ marginTop: 8, width: "100%" }}
        onClick={() => void send()}
        disabled={sending || !text.trim()}
      >
        <IconSend size={14} /> Post comment
      </button>
    </section>
  );
}
