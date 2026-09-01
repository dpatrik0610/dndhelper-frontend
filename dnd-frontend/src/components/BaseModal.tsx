import { Modal, Group, Button, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMemo, type ReactNode } from "react";
import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "@hooks/useIsMobile";

interface BaseModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string | number;
  loading?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
  saveLabel?: string;
  showCancelButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  withCloseButton?: boolean;
  fullScreen?: boolean;
  hideHeader?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  opened,
  onClose,
  title,
  children,
  size = "lg",
  loading = false,
  onSave,
  showSaveButton = true,
  saveLabel = "Save",
  showCancelButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withCloseButton = true,
  fullScreen = false,
  hideHeader = false,
}) => {
  const sidebarTheme = useUiStore((s) => s.sidebarTheme);
  const isMobile = useIsMobile();
  const isFullScreen = fullScreen || isMobile;

  const activeThemeClass = useMemo(() => {
    switch (sidebarTheme) {
      case "midnight":
        return "theme-midnight-arcane";
      case "crimson-vampire":
        return "theme-crimson-vampire";
      case "frost-glacier":
        return "theme-frost-glacier";
      case "sunset":
      default:
        return "theme-cyber-noir";
    }
  }, [sidebarTheme]);

  const headerVisible = !hideHeader;
  const headerStyles = hideHeader
    ? { display: "none" }
    : {
        borderBottom: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        background: isFullScreen
          ? "var(--theme-bg-panel-opaque, var(--theme-bg-panel, rgba(15, 15, 15, 0.95)))"
          : "transparent",
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
        paddingTop: "1.25rem",
      };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      classNames={{
        content: activeThemeClass,
      }}
      title={
        headerVisible ? (
          <Text
            fw={400}
            size="md"
            className="narrative-title"
            style={{
              letterSpacing: "2px",
              color: "var(--theme-color-text-primary, #fff)",
              textShadow: "0 0 10px var(--theme-border-glow, rgba(255,255,255,0.05))",
            }}
          >
            {title}
          </Text>
        ) : undefined
      }
      size={isFullScreen ? "100%" : size}
      withCloseButton={headerVisible && withCloseButton}
      closeOnClickOutside={closeOnClickOutside && !loading}
      closeOnEscape={closeOnEscape && !loading}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 12,
      }}
      transitionProps={{
        transition: "fade",
        duration: 200,
        timingFunction: "ease",
      }}
      fullScreen={isFullScreen}
      styles={{
        content: {
          backdropFilter: isFullScreen ? "none" : "blur(24px) saturate(130%)",
          WebkitBackdropFilter: isFullScreen ? "none" : "blur(24px) saturate(130%)",
          background: isFullScreen
            ? "var(--theme-bg-panel-opaque, var(--theme-bg-panel, rgba(15, 15, 15, 0.95)))"
            : "var(--theme-bg-panel, rgba(15, 15, 15, 0.85))",
          border: isFullScreen ? "none" : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1))",
          boxShadow: isFullScreen
            ? "none"
            : "0 15px 45px rgba(0, 0, 0, 0.5), var(--theme-glow-shadow-primary)",
          borderRadius: isFullScreen ? "0" : "12px",
          color: "white",
          transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          minHeight: isFullScreen ? "100vh" : undefined,
          margin: isFullScreen ? 0 : undefined,
          padding: isFullScreen ? "5px" : undefined,
          paddingTop: 0,
        },
        header: headerStyles,
        body: {
          paddingTop: "1.25rem",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
          paddingBottom: "1.25rem",
          background: "transparent",
        },
        close: {
          color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))",
          background: "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            color: "#fff",
            background: "var(--theme-bg-hover, rgba(255,255,255,0.04))",
          },
        },
      }}
    >
      {children}

      {(showSaveButton || showCancelButton) && (
        <Group justify="flex-end" mt="xl" gap="sm">
          {showCancelButton && (
            <Button
              onClick={onClose}
              disabled={loading}
              leftSection={<IconX size={14} />}
              className="glass-btn-secondary"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              Cancel
            </Button>
          )}

          {showSaveButton && onSave && (
            <Button
              onClick={onSave}
              loading={loading}
              disabled={loading}
              className="glass-btn-primary"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              {saveLabel}
            </Button>
          )}
        </Group>
      )}
    </Modal>
  );
};
