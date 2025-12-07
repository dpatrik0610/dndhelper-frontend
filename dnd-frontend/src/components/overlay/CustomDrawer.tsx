import type { CSSProperties, ReactNode } from "react";
import {
  ActionIcon,
  Box,
  Drawer,
  type DrawerProps,
  ScrollArea,
  type ScrollAreaProps,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export interface CustomDrawerProps {
  opened: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: DrawerProps["size"];
  position?: DrawerProps["position"];
  overlayOpacity?: number;
  overlayBlur?: number;
  padding?: string | number;
  cardStyle?: CSSProperties;
  withCloseButton?: boolean;
  closeIcon?: ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  scrollable?: boolean;
  scrollAreaProps?: ScrollAreaProps;
}

const baseCardStyle: CSSProperties = {
  background: "rgba(20, 18, 40, 0.85)",
  border: "1px solid rgba(140, 120, 255, 0.35)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
};

export function CustomDrawer({
  opened,
  onClose,
  children,
  size = "420px",
  position = "right",
  overlayOpacity = 0.45,
  overlayBlur = 6,
  padding = "md",
  cardStyle,
  withCloseButton = false,
  closeIcon,
  headerContent,
  footerContent,
  scrollable = true,
  scrollAreaProps,
}: CustomDrawerProps) {
  const mergedCardStyle = { ...baseCardStyle, ...cardStyle };

  const content = scrollable ? (
    <ScrollArea style={{ flex: 1 }} offsetScrollbars scrollbarSize={8} {...scrollAreaProps}>
      {children}
    </ScrollArea>
  ) : (
    <Box style={{ flex: 1 }}>{children}</Box>
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={position}
      size={size}
      overlayProps={{ backgroundOpacity: overlayOpacity, blur: overlayBlur }}
      withCloseButton={false}
      title={null}
      styles={{
        body: { padding: 0, height: "100%" },
        content: { background: "transparent", height: "100vh" },
        header: { display: "none" },
      }}
    >
      <Box
        p={padding}
        style={{ ...mergedCardStyle, height: "100%", display: "flex", flexDirection: "column", gap: 8 }}
      >
        {(headerContent || withCloseButton) && (
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <Box style={{ flex: 1 }}>{headerContent}</Box>
            {withCloseButton && (
              <ActionIcon variant="subtle" size="sm" onClick={onClose}>
                {closeIcon ?? <IconX size={16} />}
              </ActionIcon>
            )}
          </Box>
        )}

        {content}

        {footerContent}
      </Box>
    </Drawer>
  );
}
