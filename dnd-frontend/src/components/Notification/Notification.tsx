import { Container, Button, Text, type CSSProperties, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconAlertTriangle, type ReactNode, IconBoomFilled } from '@tabler/icons-react';
// import './Notification.module.css';

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
 * 🔔 Fully customizable notification utility.
 * Wraps Mantine's `notifications.show()` with strong typing and sane defaults.
 */
export const showNotification = ({
  id,
  title,
  message,
  color = 'blue',
  icon = <IconBoomFilled size={18} />,
  position,
  withBorder,
  withCloseButton = true,
  onClose,
  onOpen,
  autoClose = 3000,
  radius,
  className,
  style = {'backgroundColor': 'rgba(0, 0, 0, 0.27)', 'color': 'white', 'backdropFilter': 'blur(10px)', 'border': '1px solid rgba(255, 255, 255, 0.18)', marginBottom: '10px'} as CSSProperties,
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
  style,
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

export default function Notifier() {    
    return (
        <Container className={''} style={{ padding: '20px', textAlign: 'center' }}>
        <div className={'notification-container'}>
            <div className={'button-group'}>
            <Button
                color="teal"
                onClick={() =>
                    showNotification({title: 'Success!', message: 'Operation completed successfully.', color: 'teal',})
                }
            >
                Show Success
            </Button>

            <Button
                color="red"
                onClick={() =>
                    showNotification({title: 'Error!', message: 'Something went wrong :(', color: 'red', icon: <IconX size={18} />})
                }
            >
                Show Success
            </Button>

            <Button
                color="yellow"
                onClick={() =>
                showNotification({title: 'Warning!', message: 'This is a warning message.', color: 'yellow', icon: <IconAlertTriangle size={18} />})
                }
            >
                Show Warning
            </Button>

            <Button
                color="blue"
                onClick={() =>
                showNotification({title: 'Info', message: 'This is an informational message.', color: 'blue', icon: <IconCheck size={18} />})
                }
            >
                Show Loading
            </Button>
            <Button
                color="gray"
                onClick={() =>
                showNotification({title: 'Loading', message: 'Please wait...', color: 'gray', loading: true, autoClose: false})
                }
            >
                Show Loading
            </Button>
            </div>
        </div>
        </Container>
    );
}
