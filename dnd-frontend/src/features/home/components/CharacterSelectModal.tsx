import {
  Modal,
  Avatar,
  Badge,
  Group,
  Text,
  ScrollArea,
  Title,
  Button,
  SimpleGrid,
  Stack,
  Box,
} from "@mantine/core";
import { IconPlus, IconUserCircle } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import type { Character } from "@appTypes/Character/Character";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@hooks/useIsMobile";
import { useUiStore } from "@store/ui/uiStore";
import { getActiveThemeClass } from "@features/navigation/Sidebar/sidebarThemes";

interface CharacterSelectModalProps {
  opened: boolean;
  onClose: () => void;
  characters: Character[];
  onSelect: (character: Character) => void;
}

export function CharacterSelectModal({
  opened,
  onClose,
  characters,
  onSelect,
}: CharacterSelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const sidebarTheme = useUiStore((s) => s.sidebarTheme);

  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  const handleSelect = (char: Character) => {
    setSelected(char.id ?? null);
    setTimeout(() => {
      onSelect(char);
      onClose();
      setSelected(null);
    }, 180);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      fullScreen={isMobile}
      classNames={{
        content: activeThemeClass,
      }}
      title={
        <Group gap={10}>
          <Title
            order={3}
            className="narrative-title"
            style={{
              color: "var(--theme-color-text-primary, #fff)",
              textShadow: "0 0 12px var(--theme-border-glow, rgba(255,255,255,0.15))",
              fontSize: "1.10rem",
            }}
          >
            Choose Your Character
          </Title>
        </Group>
      }
      overlayProps={{ blur: 12, backgroundOpacity: 0.4 }}
      styles={{
        content: {
          background: isMobile
            ? "var(--theme-bg-panel-opaque, var(--theme-bg-panel, rgba(15, 15, 15, 0.95)))"
            : "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          border: isMobile ? "none" : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
          borderTop: isMobile ? "none" : "4px solid var(--theme-color-accent-primary, #f59e0b)",
          boxShadow: isMobile ? "none" : "0 20px 50px rgba(0, 0, 0, 0.5), var(--theme-glow-shadow-primary)",
          backdropFilter: isMobile ? "none" : "blur(24px) saturate(130%)",
          WebkitBackdropFilter: isMobile ? "none" : "blur(24px) saturate(130%)",
          borderRadius: isMobile ? "0" : "16px",
          color: "var(--theme-color-text-primary, #fff)",
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        },
        header: {
          background: "transparent",
          borderBottom: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05))",
          padding: "16px 24px",
        },
        body: {
          padding: "24px",
          background: "transparent",
        },
        close: {
          color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
          transition: "all 0.2s ease",
          "&:hover": {
            background: "var(--theme-bg-hover, rgba(255, 255, 255, 0.1))",
            color: "var(--theme-color-text-primary, #ffffff)",
          }
        }
      }}
      transitionProps={{ transition: "pop" }}
    >
      <ScrollArea h={isMobile ? "calc(100vh - 140px)" : 450} type="scroll" offsetScrollbars>
        {characters.length === 0 ? (
          <Stack align="center" justify="center" h={300} gap="md">
            <IconUserCircle size={64} style={{ opacity: 0.3, color: "var(--theme-color-accent-primary)" }} />
            <Text size="lg" style={{ color: "var(--theme-color-text-secondary)", fontStyle: "italic" }}>
              No characters found
            </Text>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" pb="md">
            {characters.map((char) => {
              const isSelected = selected === char.id;
              return (
                <Box
                  key={char.id}
                  onClick={() => handleSelect(char)}
                  style={{
                    background: isSelected
                      ? "var(--theme-gradient-active, rgba(245, 158, 11, 0.15))"
                      : "var(--theme-bg-card, rgba(255, 255, 255, 0.03))",
                    border: "1px solid",
                    borderColor: isSelected
                      ? "var(--theme-color-accent-primary, #f59e0b)"
                      : "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                    borderRadius: "12px",
                    padding: "16px",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    boxShadow: isSelected
                      ? "0 0 15px var(--theme-border-glow), var(--theme-glow-shadow-primary)"
                      : "none",
                    transform: isSelected ? "scale(0.98)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.06))";
                      e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.2))";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25), var(--theme-glow-shadow-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.03))";
                      e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <Group wrap="nowrap" align="center">
                   <Avatar
                     src={char.imageUrl || undefined}
                     radius="md"
                     size={64}
                     style={{
                       border: "2px solid var(--theme-color-accent-primary)",
                       background: char.imageUrl ? "transparent" : "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                       boxShadow: "var(--theme-glow-shadow-primary)",
                       color: "#121214",
                       fontWeight: 900,
                       fontSize: "1.5rem",
                     }}
                   >
                     {char.name.charAt(0).toUpperCase()}
                   </Avatar>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        fw={800}
                        size="xl"
                        truncate
                        style={{
                          letterSpacing: "0.3px",
                          fontSize: "1.25rem",
                          color: isSelected
                            ? "var(--theme-color-text-glow, #ffffff)"
                            : "var(--theme-color-text-primary, #ffffff)",
                          textShadow: isSelected
                            ? "0 0 10px var(--theme-border-glow)"
                            : "none",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {char.name}
                      </Text>

                      <Group gap="xs" mt={8} wrap="wrap">
                        <Badge
                          radius="sm"
                          size="md"
                          style={{
                            background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                            border: "none",
                            color: "#121214",
                            fontWeight: 800,
                            boxShadow: "var(--theme-glow-shadow-primary)",
                          }}
                        >
                          Lvl {char.level}
                        </Badge>

                        <Badge
                          radius="sm"
                          size="md"
                          style={{
                            background: "rgba(0, 0, 0, 0.25)",
                            border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))",
                            color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {char.race}
                        </Badge>

                        {char.characterClass && (
                          <Badge
                            radius="sm"
                            size="md"
                            style={{
                              background: "rgba(0, 0, 0, 0.25)",
                              border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))",
                              color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {char.characterClass}
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </ScrollArea>

      <Group
        justify="flex-end"
        mt="md"
        pt="md"
        style={{ borderTop: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.05))" }}
      >
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            onClose();
            navigate("/newCharacter");
          }}
          size="md"
          radius="md"
          style={{
            background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
            border: "none",
            color: "#121214",
            boxShadow: "var(--theme-glow-shadow-primary)",
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.15)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary), 0 4px 12px rgba(0,0,0,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "none";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary)";
          }}
        >
          New Character
        </Button>
      </Group>
    </Modal>
  );
}
