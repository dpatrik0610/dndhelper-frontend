import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Box, Group, Title, Text, Tooltip, Popover, Badge, Divider } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { longrest } from "@services/characterService";
import { loadCharacters } from "@utils/loadCharacter";

import { CharacterCurrencyArea } from "./CharacterCurrencyArea";
import { showNotification } from "@components/Notification/Notification";
import { HpRing } from "./HpRing";
import { XpProgressCard } from "./XpProgressCard";
import { InspirationBox } from "./InspirationBox";
import { SwitchCharacterButton } from "./SwitchCharacterButton";
import { useIsMobile } from "@hooks/useIsMobile";

// Icons
import {
  IconEdit,
  IconMoon,
  IconFlame,
  IconDice5,
  IconHeartPlus,
  IconCoin,
  IconAward,
} from "@tabler/icons-react";

// Modals
import { AddConditionModal } from "./AddConditionModal";
import { HpModal } from "./HpModal";
import { MoneyModal } from "./MoneyModal";
import { RollModal } from "./RollModal";
import { ActionBubble } from "./ActionBubble";

export function CharacterHeader() {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Modals state
  const [addConditionOpened, setAddConditionOpened] = useState(false);
  const [hpOpened, setHpOpened] = useState(false);
  const [moneyOpened, setMoneyOpened] = useState(false);
  const [rollOpened, setRollOpened] = useState(false);

  if (!character) return null;

  async function handleUseInspiration() {
    if (!character) return;
    if (!character.inspiration || character.inspiration <= 0) return;

    const confirmed = window.confirm("Use one point of Inspiration?");
    if (!confirmed) return;

    const newInspiration = character.inspiration - 1;
    updateCharacter({ inspiration: newInspiration });

    showNotification({
      title: "Inspiration used",
      message: "You spent 1 Inspiration point.",
      color: "blue",
    });
  }

  async function handleLongrest() {
    if (!character?.id) return;
    try {
      await longrest(character.id);
      await loadCharacters();
      showNotification({
        id: "longrest-success",
        title: "Success",
        message: "You slept through the night 🙂",
        icon: <IconMoon size={16} />,
      });
    } catch (err) {
      showNotification({
        title: "Long rest failed",
        message: String(err),
        color: "red",
      });
    }
  }

  // Construct meta text safely
  const metaItems = [character.race, character.characterClass, character.alignment].filter(Boolean);
  const metaString = metaItems.length > 0 ? metaItems.join(" • ") : "No details set";

  return (
    <>
      <Box
        mb="xl"
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: 16,
          padding: isMobile ? "16px" : "24px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        }}
      >
        <Stack gap="lg">
          <Group wrap={isMobile ? "wrap" : "nowrap"} align="flex-start" gap="xl" style={{ width: "100%" }}>
            
            {/* Left: HP */}
            <Box style={{ flexShrink: 0, margin: isMobile ? "0 auto" : 0 }}>
              <HpRing character={character} size={isMobile ? 120 : 130} />
            </Box>

            {/* Center: Info & Inspiration */}
            <Stack gap="xs" style={{ flex: 1, minWidth: isMobile ? "100%" : 0, textAlign: isMobile ? "center" : "left" }}>
              
              <Group gap="sm" wrap="nowrap" justify={isMobile ? "center" : "flex-start"} align="center">
                <Title
                  order={1}
                  className="narrative-title"
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? "20px" : "26px",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    lineHeight: 1.2,
                  }}
                >
                  {character.name || "Unnamed"}
                </Title>
                <SwitchCharacterButton />
              </Group>

              <Text size="sm" style={{ color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {metaString}
              </Text>

              <Box mt={isMobile ? "xs" : "auto"} style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
                <InspirationBox value={character.inspiration} onClick={handleUseInspiration} />
              </Box>

            </Stack>

            {/* Right: Currency */}
            <Box style={{ width: isMobile ? "100%" : "260px", flexShrink: 0 }}>
              <CharacterCurrencyArea
                character={character}
                containerStyle={{
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  padding: 0,
                }}
              />
            </Box>
            
          </Group>

          {/* Bottom: XP Bar */}
          <Box style={{ width: "100%" }}>
            <XpProgressCard experience={character.experience} containerStyle={{ margin: 0 }} />
          </Box>

          {/* Action Bubbles row right inside the glassy card below the XP Bar */}
          <Group justify="space-between" align="center" style={{ width: "100%" }}>
            {/* Left: General Actions */}
            <Group gap="xs">
              <Tooltip label="Edit Character" position="top" withArrow>
                <ActionBubble
                  label="Edit Character"
                  icon={<IconEdit size={isMobile ? 24 : 28} />}
                  onClick={() => navigate("/editCharacter")}
                  color="rgba(21, 170, 191, 0.18)"
                />
              </Tooltip>

              <Tooltip label="Long Rest" position="top" withArrow>
                <ActionBubble
                  label="Long Rest"
                  icon={<IconMoon size={isMobile ? 24 : 28} />}
                  onClick={handleLongrest}
                  color="rgba(103, 115, 250, 0.18)"
                />
              </Tooltip>

              <Tooltip label="Add Condition" position="top" withArrow>
                <ActionBubble
                  label="Add Condition"
                  icon={<IconFlame size={isMobile ? 24 : 28} />}
                  onClick={() => setAddConditionOpened(true)}
                  color="rgba(255, 90, 0, 0.18)"
                />
              </Tooltip>

              <Popover position="bottom" withArrow shadow="md" trapFocus={false}>
                <Popover.Target>
                  <div>
                    <Tooltip label="Proficiencies" position="top" withArrow>
                      <ActionBubble
                        label="Proficiencies"
                        icon={<IconAward size={isMobile ? 24 : 28} />}
                        onClick={() => {}}
                        color="var(--theme-color-accent-secondary, rgba(6, 182, 212, 0.18))"
                      />
                    </Tooltip>
                  </div>
                </Popover.Target>
                <Popover.Dropdown
                  style={{
                    background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.9))",
                    backdropFilter: "blur(24px) saturate(130%)",
                    WebkitBackdropFilter: "blur(24px) saturate(130%)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), var(--theme-glow-shadow-primary)",
                    padding: "16px",
                    color: "var(--theme-color-text-primary, #fff)",
                    maxWidth: "280px",
                  }}
                >
                  <Stack gap="xs">
                    <Text
                      fw={300}
                      size="xs"
                      tt="uppercase"
                      style={{
                        letterSpacing: "2px",
                        color: "var(--theme-color-text-secondary, #cbd5e1)",
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                      }}
                    >
                      Weapons & Tools
                    </Text>
                    {character.proficiencies?.length ? (
                      <Group gap={6}>
                        {character.proficiencies.map((p, i) => (
                          <Badge
                            key={i}
                            radius="sm"
                            style={{
                              background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
                              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                              color: "var(--theme-color-text-primary, #fff)",
                              fontWeight: 700,
                            }}
                          >
                            {p}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                        None
                      </Text>
                    )}

                    <Divider color="rgba(255, 255, 255, 0.08)" my={4} />

                    <Text
                      fw={300}
                      size="xs"
                      tt="uppercase"
                      style={{
                        letterSpacing: "2px",
                        color: "var(--theme-color-text-secondary, #cbd5e1)",
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                      }}
                    >
                      Languages
                    </Text>
                    {character.languages?.length ? (
                      <Group gap={6}>
                        {character.languages.map((l, i) => (
                          <Badge
                            key={i}
                            radius="sm"
                            style={{
                              background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
                              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                              color: "var(--theme-color-text-primary, #fff)",
                              fontWeight: 700,
                            }}
                          >
                            {l}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                        None
                      </Text>
                    )}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </Group>

            {/* Right: Rolled/Combat Actions */}
            <Group gap="xs">
              <Tooltip label="Roll Dice" position="top" withArrow>
                <ActionBubble
                  label="Roll Dice"
                  icon={<IconDice5 size={isMobile ? 24 : 28} />}
                  onClick={() => setRollOpened(true)}
                  color="rgba(156, 54, 250, 0.18)"
                />
              </Tooltip>

              <Tooltip label="Manage HP" position="top" withArrow>
                <ActionBubble
                  label="Manage HP"
                  icon={<IconHeartPlus size={isMobile ? 24 : 28} />}
                  onClick={() => setHpOpened(true)}
                  color="rgba(240, 62, 62, 0.18)"
                />
              </Tooltip>

              <Tooltip label="Manage Money" position="top" withArrow>
                <ActionBubble
                  label="Manage Money"
                  icon={<IconCoin size={isMobile ? 24 : 28} />}
                  onClick={() => setMoneyOpened(true)}
                  color="rgba(240, 140, 0, 0.18)"
                />
              </Tooltip>
            </Group>
          </Group>
        </Stack>
      </Box>

      {/* Modals */}
      <AddConditionModal opened={addConditionOpened} onClose={() => setAddConditionOpened(false)} />
      <HpModal opened={hpOpened} onClose={() => setHpOpened(false)} />
      <MoneyModal opened={moneyOpened} onClose={() => setMoneyOpened(false)} />
      <RollModal opened={rollOpened} onClose={() => setRollOpened(false)} />
    </>
  );
}
