import { ActionIcon, Box, Group, Modal, Text } from "@mantine/core";
import type { ModalProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMemo, type ReactNode } from "react";
import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "@hooks/useIsMobile";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";

export type AdminGlassModalVariant = "default" | "danger";

interface AdminGlassModalProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: ModalProps["size"];
  variant?: AdminGlassModalVariant;
  centered?: boolean;
  fullScreen?: boolean;
  padding?: ModalProps["padding"];
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  loading?: boolean;
  withCloseButton?: boolean;
}

const variantStyles: Record<
  AdminGlassModalVariant,
  { content: React.CSSProperties; titleColor: string }
> = {
  default: {
    content: {
      background: "var(--theme-bg-panel, rgba(22, 24, 32, 0.96))",
      border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
      backdropFilter: "blur(24px) saturate(130%)",
      boxShadow: "0 15px 45px rgba(0, 0, 0, 0.5), var(--theme-glow-shadow-primary)",
    },
    titleColor: "var(--theme-color-text-primary, white)",
  },
  danger: {
    content: {
      background: "rgba(40, 12, 18, 0.96)",
      border: "1px solid rgba(255, 100, 100, 0.2)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    },
    titleColor: "#fca5a5",
  },
};

export function AdminGlassModal({
  opened,
  onClose,
  title,
  children,
  size = "md",
  variant = "default",
  centered = true,
  fullScreen = false,
  padding = "md",
  closeOnClickOutside = true,
  closeOnEscape = true,
  loading = false,
  withCloseButton = true,
}: AdminGlassModalProps) {
  const sidebarTheme = useUiStore((s) => s.sidebarTheme);
  const isMobile = useIsMobile();
  const isFullScreen = fullScreen || isMobile;

  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  const theme = variantStyles[variant];

  const modalContentStyles = useMemo(() => {
    if (isFullScreen) {
      return {
        background: variant === "danger"
          ? "rgb(40, 12, 18)"
          : "var(--theme-bg-panel-opaque, var(--theme-bg-panel, rgba(15, 15, 15, 0.95)))",
        border: "none",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        boxShadow: "none",
        borderRadius: 0,
        color: "white",
        minHeight: "100vh",
        margin: 0,
      };
    }
    return {
      ...theme.content,
      borderRadius: 12,
      color: "white",
    };
  }, [isFullScreen, variant, theme]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      classNames={{
        content: `${activeThemeClass} ${variant === "danger" ? "modal-variant-danger" : ""}`,
      }}
      withCloseButton={false}
      centered={centered}
      fullScreen={isFullScreen}
      size={size}
      padding={padding}
      closeOnClickOutside={closeOnClickOutside && !loading}
      closeOnEscape={closeOnEscape && !loading}
      overlayProps={{ backgroundOpacity: 0.35, blur: 12 }}
      transitionProps={{ transition: "fade", duration: 180 }}
      styles={{
        header: { display: "none" },
        body: {
          paddingTop: title || withCloseButton ? 0 : undefined,
          background: "transparent",
        },
        content: modalContentStyles,
      }}
    >
      {(title || withCloseButton) && (
        <Group justify="space-between" align="center" mb="md" px={padding === 0 ? "md" : undefined} wrap="nowrap" mt={padding === 0 ? "md" : 12}>
          {title ? (
            typeof title === "string" ? (
              <Text fw={700} size="lg" c={theme.titleColor}>
                {title}
              </Text>
            ) : (
              <Box style={{ flex: 1, minWidth: 0 }}>{title}</Box>
            )
          ) : (
            <span />
          )}

          {withCloseButton && (
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              size="md"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              style={{
                color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.04))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--theme-color-text-secondary, rgba(255,255,255,0.6))";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      )}

      {children}
    </Modal>
  );
}
