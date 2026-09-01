import { Modal, Group, Button, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMemo, type ReactNode } from "react";
import { useUiStore } from "@store/ui/uiStore";

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
        background: "transparent",
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
      size={fullScreen ? "100%" : size}
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
      fullScreen={fullScreen}
      styles={{
        content: {
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.85))",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1))",
          boxShadow:
            "0 15px 45px rgba(0, 0, 0, 0.5), var(--theme-glow-shadow-primary)",
          borderRadius: fullScreen ? "0" : "12px",
          color: "white",
          transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
          minHeight: fullScreen ? "100vh" : undefined,
          margin: fullScreen ? 0 : undefined,
          padding: fullScreen ? "5px" : undefined,
          paddingTop: 0,
        },
        header: headerStyles,
        body: {
          paddingTop: "1.25rem",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
          paddingBottom: "1.25rem",
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
