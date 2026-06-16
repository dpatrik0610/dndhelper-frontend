import { notifications } from '@mantine/notifications';
import { IconCactus } from '@tabler/icons-react';
import type { CSSProperties, ReactNode } from 'react';

export interface ShowNotificationOptions {
  id?: string;
  title?: string;
  message: string;
  color?: string;
  icon?: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  withBorder?: boolean;
  withCloseButton?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  autoClose?: number | boolean;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
}

const colorGlowMap: Record<string, { border: string; glow: string }> = {
  blue: { border: 'rgba(59, 130, 246, 0.35)', glow: 'rgba(59, 130, 246, 0.15)' },
  green: { border: 'rgba(16, 185, 129, 0.35)', glow: 'rgba(16, 185, 129, 0.15)' },
  red: { border: 'rgba(239, 68, 68, 0.35)', glow: 'rgba(239, 68, 68, 0.15)' },
  yellow: { border: 'rgba(245, 158, 11, 0.35)', glow: 'rgba(245, 158, 11, 0.15)' },
  violet: { border: 'rgba(139, 92, 246, 0.35)', glow: 'rgba(139, 92, 246, 0.15)' },
  purple: { border: 'rgba(139, 92, 246, 0.35)', glow: 'rgba(139, 92, 246, 0.15)' },
  orange: { border: 'rgba(249, 115, 22, 0.35)', glow: 'rgba(249, 115, 22, 0.15)' },
  teal: { border: 'rgba(20, 184, 166, 0.35)', glow: 'rgba(20, 184, 166, 0.15)' },
  pink: { border: 'rgba(236, 72, 153, 0.35)', glow: 'rgba(236, 72, 153, 0.15)' },
  cyan: { border: 'rgba(6, 182, 212, 0.35)', glow: 'rgba(6, 182, 212, 0.15)' },
};

/**
 * Generates glassy styled inline CSS for a notification based on its type/color.
 */
export const getUnifiedNotificationStyle = (color?: string): CSSProperties => {
  const normalizedColor = color?.toLowerCase() || 'blue';
  const glow = colorGlowMap[normalizedColor] || colorGlowMap.blue;

  return {
    backgroundColor: 'rgba(15, 15, 25, 0.65)',
    border: `1px solid ${glow.border}`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 12px ${glow.glow}`,
    borderRadius: '8px',
    marginBottom: '10px',
    padding: '12px',
  };
};

// Deduplication cache
const recentNotifications = new Map<string, number>();
const DEBOUNCE_MS = 1000; // 1 second debounce window to prevent duplicate notifications

/**
 * Fully customizable notification utility.
 * Wraps Mantine's `notifications.show()` with strong typing, deduplication, and a glassy theme.
 */
export const showNotification = ({
  id,
  title,
  message,
  color = 'blue',
  icon = <IconCactus size={18} />,
  position,
  withBorder,
  withCloseButton = true,
  onClick,
  onClose,
  onOpen,
  autoClose = 3000,
  radius,
  className = '',
  style,
  loading,
}: ShowNotificationOptions) => {
  // Deduplicate notifications
  const cacheKey = id || `${title ?? ''}||${message}`;
  const now = Date.now();
  const lastTime = recentNotifications.get(cacheKey);

  if (lastTime && now - lastTime < DEBOUNCE_MS) {
    console.debug(`[Notification] Suppressed duplicate: "${title ?? ''}: ${message}"`);
    return;
  }
  recentNotifications.set(cacheKey, now);

  // Evict older entries from cache if it becomes too large
  if (recentNotifications.size > 100) {
    for (const [key, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > 10000) {
        recentNotifications.delete(key);
      }
    }
  }

  const mergedClassName = `glassy-notification ${className}`.trim();
  const resolvedStyle = style || getUnifiedNotificationStyle(color);

  notifications.show({
    id,
    title,
    message,
    color,
    icon,
    position,
    withBorder,
    withCloseButton,
    onClick,
    onClose,
    onOpen,
    autoClose,
    radius,
    className: mergedClassName,
    style: resolvedStyle,
    loading,
  });
};

/**
 * Updates an existing notification.
 */
export const updateNotification = ({
  id,
  title,
  message,
  color = 'blue',
  icon,
  position,
  withBorder,
  withCloseButton,
  onClick,
  onClose,
  onOpen,
  autoClose,
  radius,
  className = '',
  style,
  loading,
}: ShowNotificationOptions) => {
  if (!id) {
    console.warn('updateNotification called without an id');
    return;
  }

  // Update the deduplication cache timestamp to allow subsequent updates to register
  recentNotifications.set(id, Date.now());

  const mergedClassName = `glassy-notification ${className}`.trim();
  const resolvedStyle = style || getUnifiedNotificationStyle(color);

  notifications.update({
    id,
    title,
    message,
    color,
    icon,
    position,
    withBorder,
    withCloseButton,
    onClick,
    onClose,
    onOpen,
    autoClose,
    radius,
    className: mergedClassName,
    style: resolvedStyle,
    loading,
  });
};
