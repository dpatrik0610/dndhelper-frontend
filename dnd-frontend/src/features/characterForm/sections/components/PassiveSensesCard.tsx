import { Group, Stack, Divider, Text, Box } from "@mantine/core";
import { IconTrendingUp } from "@tabler/icons-react";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";

interface PassiveSensesCardProps {
  passivePerception: number;
  passiveInsight: number;
  passiveInvestigation: number;
  isMobile: boolean;
}

export function PassiveSensesCard({
  passivePerception,
  passiveInsight,
  passiveInvestigation,
  isMobile,
}: PassiveSensesCardProps) {
  const input = { input: "glassy-input", label: "glassy-label" };

  return (
    <Box
      style={{
        background: "rgba(255, 255, 255, 0.015)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <Group gap="xs" mb="sm">
        <IconTrendingUp size={16} style={{ color: "var(--theme-color-accent-secondary)" }} />
        <Text
          className="narrative-title"
          style={{
            fontSize: "12px",
            letterSpacing: "1.5px",
            color: "var(--theme-color-text-primary, #fff)",
          }}
        >
          Passive Senses
        </Text>
      </Group>

      <Divider color="rgba(255,255,255,0.03)" mb="sm" />

      <Group grow wrap={isMobile ? "wrap" : "nowrap"} gap="md">
        <Stack gap={0}>
          <FormNumberInput
            label={
              <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                <span>Passive Perception</span>
                <InfoIconPopover title="Passive Perception">
                  10 + Wisdom modifier + proficiency bonus (if proficient in Perception).
                </InfoIconPopover>
              </Group>
            }
            classNames={input}
            value={passivePerception}
            disabled
            hideControls
            onChange={() => {}}
            styles={{
              input: {
                textAlign: "center",
                border: "1px solid rgba(255,255,150,0.35)",
                color: "#fff8c4",
                pointerEvents: "none",
              },
            }}
          />
        </Stack>

        <Stack gap={0}>
          <FormNumberInput
            label={
              <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                <span>Passive Insight</span>
                <InfoIconPopover title="Passive Insight">
                  10 + Wisdom modifier + proficiency bonus (if proficient in Insight).
                </InfoIconPopover>
              </Group>
            }
            classNames={input}
            value={passiveInsight}
            disabled
            hideControls
            onChange={() => {}}
            styles={{
              input: {
                textAlign: "center",
                border: "1px solid rgba(150,255,255,0.35)",
                color: "#c4faff",
                pointerEvents: "none",
              },
            }}
          />
        </Stack>

        <Stack gap={0}>
          <FormNumberInput
            label={
              <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                <span>Passive Investigation</span>
                <InfoIconPopover title="Passive Investigation">
                  10 + Intelligence modifier + proficiency bonus (if proficient in Investigation).
                </InfoIconPopover>
              </Group>
            }
            classNames={input}
            value={passiveInvestigation}
            disabled
            hideControls
            onChange={() => {}}
            styles={{
              input: {
                textAlign: "center",
                border: "1px solid rgba(150,150,255,0.35)",
                color: "#c4d4ff",
                pointerEvents: "none",
              },
            }}
          />
        </Stack>
      </Group>
    </Box>
  );
}
