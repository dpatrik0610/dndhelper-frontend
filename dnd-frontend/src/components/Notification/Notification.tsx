import { notifications } from '@mantine/notifications';
import { IconCactus } from '@tabler/icons-react';
import type { CSSProperties, ReactNode } from 'react';

const defaultNotificationStyle: CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.27)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: '10px',
};

export interface ShowNotificationOptions {
  id?: string;
  title?: string;
  message: string;
  color?: string;
  icon?: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  withBorder?: boolean;
  withCloseButton?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  autoClose?: number | boolean;
  radius?: string | number;
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
}

/**
 * Fully customizable notification utility.
 * Wraps Mantine's `notifications.show()` with strong typing and sane defaults.
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
  onClose,
  onOpen,
  autoClose = 3000,
  radius,
  className,
  style = defaultNotificationStyle,
  loading,
}: ShowNotificationOptions) => {
  notifications.show({
    id,
    title,
    message,
    color,
    icon,
    position,
    withBorder,
    withCloseButton,
    onClose,
    onOpen,
    autoClose,
    radius,
    className,
    style,
    loading,
  });
};

export const updateNotification = ({
  id,
  title,
  message,
  color,
  icon,
  position,
  withBorder,
  withCloseButton,
  onClose,
  onOpen,
  autoClose,
  radius,
  className,
  style = defaultNotificationStyle,
  loading,
}: ShowNotificationOptions) => {
  if (!id) {
    console.warn('updateNotification called without an id');
    return;
  }

  notifications.update({
    id,
    title,
    message,
    color,
    icon,
    position,
    withBorder,
    withCloseButton,
    onClose,
    onOpen,
    autoClose,
    radius,
    className,
    style,
    loading,
  });
};
