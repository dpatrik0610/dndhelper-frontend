import { useRef } from 'react';
import { showNotification, updateNotification } from './Notification';
import { IconCheck, IconX, IconLoader } from '@tabler/icons-react';

interface UseLoadingNotificationOptions {
  id?: string;
  title?: string;
  message?: string;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  autoClose?: number; // ms
}

export function useLoadingNotification(options?: UseLoadingNotificationOptions) {
  const notificationId = useRef(options?.id || 'loading-notification');
  const isActive = useRef(false);

  const toggle = (loading: boolean, success = true) => {
    if (loading) {
      // show persistent loading notification
      showNotification({
        id: notificationId.current,
        title: options?.title || 'Loading...',
        message: options?.message || 'Please wait',
        color: 'blue',
        icon: <IconLoader size={18} className="spin" />,
        autoClose: false,
        loading: true,
      });
      isActive.current = true;
    } 
    else if (isActive.current) {
      // update notification to success/failure and close after timeout
      updateNotification({
        id: notificationId.current,
        title: success ? options?.successTitle || 'Success' : options?.errorTitle || 'Error',
        message: success ? options?.successMessage || 'Operation completed!' : options?.errorMessage || 'Something went wrong',
        color: success ? 'green' : 'red',
        icon: success ? <IconCheck size={18} /> : <IconX size={18} />,
        loading: false,
        autoClose: options?.autoClose ?? 3000,
      });
      isActive.current = false;
    }
  };

  return toggle;
}