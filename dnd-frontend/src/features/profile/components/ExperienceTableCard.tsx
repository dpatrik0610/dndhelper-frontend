import { useState } from "react";
import { Badge, Group, Table, Text, Progress, Box, Stack, ThemeIcon, Collapse, Divider } from "@mantine/core";
import { IconAward, IconChevronDown, IconChevronUp, IconSparkles } from "@tabler/icons-react";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { EXPERIENCE_TABLE, getLevelForExperience, getExperienceProgress } from "@utils/experienceTable";
import { useIsMobile } from "@hooks/useIsMobile";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";

export function ExperienceTableCard() {
  const character = useCurrentCharacter();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  if (!character) return null;

  const currentXpLevel = getLevelForExperience(character.experience).level;
  const expProgress = getExperienceProgress(character.experience);
  const hasNext = !!expProgress.next;

  const xpToNextText = hasNext
    ? `${expProgress.remaining.toLocaleString()} XP to Level ${expProgress.next!.level}`
    : "Maximum Level Reached";

  return (
    <ExpandableSection
      title="Experience & Leveling"
      color={SectionColor.Orange}
      defaultOpen
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        borderRadius: 16,
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        transition: "all 0.25s ease",
        overflow: "hidden",
        marginTop: "16px",
      }}
      expandable={false}
    >
      <Stack gap="md" style={{ padding: isMobile ? "0px" : "4px" }}>
        
        {/* UPPER DECK: Experience Progress & Level Badge */}
        <Group wrap={isMobile ? "wrap" : "nowrap"} gap="md" align="center" style={{ width: "100%" }}>
          
          {/* Level Crest */}
          <ThemeIcon
            size={isMobile ? 56 : 64}
            radius="md"
            style={{
              background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
              boxShadow: "var(--theme-glow-shadow-primary)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              flexShrink: 0,
              margin: isMobile ? "0 auto" : "0",
            }}
          >
            <Stack gap={0} align="center" justify="center" h="100%">
              <Text size="xs" fw={850} style={{ fontSize: "9px", opacity: 0.95, lineHeight: 1, marginTop: 4, color: "#121214" }}>
                LEVEL
              </Text>
              <Text fw={900} style={{ fontSize: isMobile ? "24px" : "28px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.15)", color: "#121214" }}>
                {expProgress.current.level}
              </Text>
            </Stack>
          </ThemeIcon>

          {/* Progress Bar & Details */}
          <Box style={{ flex: 1, minWidth: isMobile ? "100%" : 0 }}>
            <Group justify="space-between" mb={8} align="flex-end" gap="xs">
              <Stack gap={2} style={{ minWidth: "40%" }}>
                <Text
                  size="xs"
                  fw={800}
                  style={{
                    color: "var(--theme-color-accent-primary, #f59e0b)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Experience Progress
                </Text>
                <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.65))", fontWeight: 700 }}>
                  {character.experience.toLocaleString()} / {hasNext ? expProgress.next!.experience.toLocaleString() : "Max"} XP
                </Text>
              </Stack>

              <Text
                size="xs"
                fw={800}
                style={{
                  color: "var(--theme-color-text-primary, #fff)",
                  letterSpacing: "0.5px",
                  textAlign: isMobile ? "left" : "right",
                }}
              >
                {xpToNextText}
              </Text>
            </Group>

            <Progress
              value={expProgress.progressPercent}
              size="md"
              radius="xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.35)",
                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
              }}
              styles={{
                section: {
                  background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                  boxShadow: "var(--theme-glow-shadow-primary)",
                  transition: "width 250ms ease",
                },
              }}
            />
          </Box>
        </Group>

        <Divider style={{ borderColor: "rgba(255, 255, 255, 0.06)" }} my={4} />

        {/* LOWER DECK: Collapsible Progression Chart Header */}
        <Group
          justify="space-between"
          align="center"
          onClick={() => setExpanded(!expanded)}
          style={{
            cursor: "pointer",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.03))";
            e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.12))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.015))";
            e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.04))";
          }}
        >
          <Group gap="xs">
            <IconAward size={16} color="var(--theme-color-accent-primary, #f59e0b)" />
            <Text
              size="xs"
              fw={800}
              style={{
                color: "var(--theme-color-text-primary, #fff)",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Official 5e Progression Chart
            </Text>
          </Group>
          <Group gap={4} align="center">
            <Text size="xs" fw={750} style={{ color: "var(--theme-color-accent-primary, #f59e0b)" }}>
              {expanded ? "Hide Chart" : "Show Chart"}
            </Text>
            {expanded ? (
              <IconChevronUp size={14} color="var(--theme-color-accent-primary, #f59e0b)" />
            ) : (
              <IconChevronDown size={14} color="var(--theme-color-accent-primary, #f59e0b)" />
            )}
          </Group>
        </Group>

        {/* Collapse content containing the 5e table */}
        <Collapse in={expanded}>
          <Box
            style={{
              maxHeight: "360px",
              overflowY: "auto",
              paddingRight: "4px",
              borderRadius: "8px",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
              background: "rgba(0, 0, 0, 0.15)",
              marginTop: "8px",
            }}
          >
            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "var(--theme-bg-panel-opaque, #140f28)",
                  zIndex: 2,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                }}
              >
                <Table.Tr>
                  <Table.Th style={{ color: "var(--theme-color-text-secondary, #cbd5e1)", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>Level</Table.Th>
                  <Table.Th style={{ color: "var(--theme-color-text-secondary, #cbd5e1)", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>XP Required</Table.Th>
                  <Table.Th style={{ color: "var(--theme-color-text-secondary, #cbd5e1)", fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>Prof. Bonus</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {EXPERIENCE_TABLE.map((row) => {
                  const isCurrent = currentXpLevel === row.level;
                  return (
                    <Table.Tr
                      key={row.level}
                      style={{
                        background: isCurrent ? "var(--theme-bg-hover, rgba(255, 255, 255, 0.03))" : "transparent",
                        color: isCurrent ? "var(--theme-color-accent-primary, #f59e0b)" : "var(--theme-color-text-primary, #fff)",
                        fontWeight: isCurrent ? 750 : 500,
                        transition: "all 200ms ease",
                      }}
                    >
                      <Table.Td style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <Group gap="xs" wrap="nowrap">
                          {isCurrent ? (
                            <IconSparkles size={13} color="var(--theme-color-accent-primary, #f59e0b)" style={{ filter: "drop-shadow(0 0 4px var(--theme-color-accent-primary))" }} />
                          ) : (
                            <div style={{ width: 13 }} />
                          )}
                          <Text size="sm" fw={isCurrent ? 800 : 500}>
                            {row.level}
                          </Text>
                          {isCurrent && (
                            <Badge
                              variant="gradient"
                              gradient={{ from: "var(--theme-color-accent-primary, #f59e0b)", to: "var(--theme-color-accent-secondary, #10b981)" }}
                              size="xs"
                              style={{
                                boxShadow: "var(--theme-glow-shadow-primary)",
                                fontWeight: 800,
                                color: "#121214",
                                border: "none",
                              }}
                            >
                              ACTIVE
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <Text size="sm">{row.experience.toLocaleString()} XP</Text>
                      </Table.Td>
                      <Table.Td style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <Text size="sm">+{row.proficiencyBonus}</Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Box>
        </Collapse>
      </Stack>
    </ExpandableSection>
  );
}
