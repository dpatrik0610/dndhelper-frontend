import {
  Group,
  Stack,
  Text,
  Box,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import {
  abilityTooltips,
  saveTooltips,
  DEFAULT_SKILLS,
} from "@features/characterForm/Tooltips/tooltips";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
type AbilityLong = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

interface AbilityCardProps {
  activeGroup: {
    key: AbilityKey;
    longKey: AbilityLong;
    label: string;
    icon: string;
  };
  modifiers: Record<AbilityKey, number>;
  skills: any[];
  characterForm: any;
  setCharacterForm: (val: any) => void;
  calcBase: (s: any) => number | null;
  isMobile: boolean;
  saveKey: string;
}

export function AbilityCard({
  activeGroup,
  modifiers,
  skills,
  characterForm,
  setCharacterForm,
  calcBase,
  isMobile,
  saveKey,
}: AbilityCardProps) {
  const input = { input: "glassy-input", label: "glassy-label" };
  
  const activeGroupMod = modifiers[activeGroup.key];
  const displayMod = activeGroupMod >= 0 ? `+${activeGroupMod}` : activeGroupMod;

  // Filter skills belonging to this single selected ability
  const groupSkills = skills.filter((s) => {
    const def = DEFAULT_SKILLS.find((d) => d.name === s.name);
    return def && def.ability === activeGroup.key;
  });

  return (
    <Box
      style={{
        background: "rgba(255, 255, 255, 0.015)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      }}
    >
      {/* Card Header (Ability and Modifier Capsule) */}
      <Group justify="space-between" mb="lg">
        <Group gap={8}>
          <Text style={{ fontSize: isMobile ? "18px" : "20px" }}>{activeGroup.icon}</Text>
          <Text
            className="narrative-title"
            style={{
              fontSize: isMobile ? "13px" : "15px",
              letterSpacing: "2.5px",
              color: "var(--theme-color-text-primary, #fff)",
            }}
          >
            {activeGroup.label}
          </Text>
        </Group>
        
        {/* Soft, Highlighted modifier pill capsule */}
        <Box
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            borderRadius: "14px",
            padding: "4px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Text
            className="narrative-title"
            style={{
              fontSize: "9px",
              letterSpacing: "1px",
              color: "var(--theme-color-text-secondary, #cbd5e1)",
            }}
          >
            Mod
          </Text>
          <Text
            fw={600}
            style={{
              fontSize: "14px",
              color: "var(--theme-color-accent-primary, #f59e0b)",
              opacity: 0.85,
            }}
          >
            {displayMod}
          </Text>
        </Box>
      </Group>

      {/* Row 1: Core Score & Saving Throw Modifier (with inline popover icons) */}
      <Group grow gap="md" align="flex-end" mb={groupSkills.length > 0 ? "lg" : 0}>
        
        {/* Score Input */}
        <Stack gap={0}>
          <FormNumberInput
            label={
              <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                <span>{activeGroup.label} Score</span>
                <InfoIconPopover title={activeGroup.label}>
                  {abilityTooltips[activeGroup.longKey]}
                </InfoIconPopover>
              </Group>
            }
            min={1}
            max={30}
            classNames={input}
            value={characterForm.abilityScores[activeGroup.key]}
            onChange={(v) =>
              setCharacterForm({
                abilityScores: {
                  ...characterForm.abilityScores,
                  [activeGroup.key]: v,
                },
              })
            }
            styles={{ input: { textAlign: "center" } }}
          />
        </Stack>

        {/* Saving Throw Input */}
        <Stack gap={0}>
          <FormNumberInput
            label={
              <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                <span>Saving Throw</span>
                <InfoIconPopover title={`${activeGroup.label} Saving Throw`}>
                  {saveTooltips[activeGroup.longKey]}
                </InfoIconPopover>
              </Group>
            }
            min={-20}
            max={30}
            classNames={input}
            value={characterForm.savingThrows[saveKey]}
            onChange={(v) =>
              setCharacterForm({
                savingThrows: {
                  ...characterForm.savingThrows,
                  [saveKey]: v,
                },
              })
            }
            styles={{ input: { textAlign: "center" } }}
          />
        </Stack>

      </Group>

      {/* Row 2: Governed Skills list */}
      {groupSkills.length > 0 && (
        <>
          <Divider color="rgba(255,255,255,0.03)" my="md" />
          <Stack gap="xs">
            {groupSkills.map((s) => {
              const def = DEFAULT_SKILLS.find((d) => d.name === s.name);
              const base = calcBase(s);
              const shown = s.value ?? s.lastBase ?? base ?? 0;

              return (
                <Group key={s.name} justify="space-between" align="center" wrap="nowrap">
                  
                  {/* Left: Star Check-Bubble + Skill Name + Info */}
                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <ActionIcon
                      onClick={() => {
                        const next = !s.proficient;
                        const b = calcBase({ ...s, proficient: next });
                        if (b === null) return;
                        setCharacterForm({
                          skills: skills.map((x) =>
                            x.name === s.name
                              ? { ...x, proficient: next, value: b, lastBase: b }
                              : x
                          ),
                        });
                      }}
                      variant="unstyled"
                      aria-label={`Toggle proficiency for ${s.name}`}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        background: s.proficient
                          ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                          : "rgba(255, 255, 255, 0.01)",
                        border: s.proficient
                          ? "1px solid rgba(255, 255, 255, 0.2)"
                          : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                        boxShadow: s.proficient
                          ? "var(--theme-glow-shadow-primary)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!s.proficient) {
                          e.currentTarget.style.borderColor = "var(--theme-color-accent-primary)";
                          e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!s.proficient) {
                          e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                        }
                      }}
                    >
                      {s.proficient && (
                        <IconStarFilled size={10} color="#fff" />
                      )}
                    </ActionIcon>

                    <Text
                      size="xs"
                      fw={s.proficient ? 700 : 500}
                      truncate="end"
                      style={{
                        color: s.proficient
                          ? "var(--theme-color-text-primary, #fff)"
                          : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                      }}
                    >
                      {s.name}
                    </Text>

                    {def && (
                      <InfoIconPopover title={s.name}>
                        {`${s.name} is governed by ${def.ability.toUpperCase()}.\n\n${def.desc}`}
                      </InfoIconPopover>
                    )}
                  </Group>

                  {/* Right: Mod Base + Number Input */}
                  <Group gap="xs" wrap="nowrap">
                    {!isMobile && (
                      <Text size="10px" c="dimmed" style={{ fontStyle: "italic" }}>
                        Base: {base! >= 0 ? `+${base}` : base}
                      </Text>
                    )}

                    <FormNumberInput
                      classNames={{ input: "glassy-input" }}
                      value={shown}
                      hideControls
                      style={{ width: 45 }}
                      styles={{ input: { textAlign: "center", padding: 0 } }}
                      onChange={(v) =>
                        setCharacterForm({
                          skills: skills.map((x) =>
                            x.name === s.name ? { ...x, value: v } : x
                          ),
                        })
                      }
                    />
                  </Group>

                </Group>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}
