import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Box, Group, Title, Text, Tooltip, Popover, Badge, Divider, ActionIcon, Button } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions, useCharacterCombatActions } from "@store/character/characterSelectors";
import { longrest, updateCharacter as apiUpdateCharacter } from "@services/characterService";
import { loadCharacters } from "@utils/loadCharacter";
import { useCharacterStore } from "@store/character/characterStore";
import { getCondition } from "@services/conditionService";

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
  IconTrash,
} from "@tabler/icons-react";

// Modals
import { AddConditionModal } from "./AddConditionModal";
import { HpModal } from "./HpModal";
import { MoneyModal } from "./MoneyModal";
import { RollModal } from "./RollModal";
import { ActionBubble } from "./ActionBubble";
import { ConditionDetailsModal } from "./ConditionDetailsModal";

export function CharacterHeader() {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const { removeCondition } = useCharacterCombatActions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Modals state
  const [addConditionOpened, setAddConditionOpened] = useState(false);
  const [hpOpened, setHpOpened] = useState(false);
  const [moneyOpened, setMoneyOpened] = useState(false);
  const [rollOpened, setRollOpened] = useState(false);

  // Active Condition Detail Modal State
  const [detailsOpened, setDetailsOpened] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [conditionDesc, setConditionDesc] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [removingDetails, setRemovingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

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

  // Active conditions direct removal hook
  const handleRemoveCondition = async (cond: string) => {
    try {
      removeCondition(cond);
      // Wait for next tick to let the Zustand store update, then persist to database
      await Promise.resolve();
      const updated = useCharacterStore.getState().character;
      if (updated) {
        await apiUpdateCharacter(updated);
      }
      showNotification({
        title: "Condition Removed",
        message: `Successfully cured "${cond.toUpperCase()}"!`,
        color: "green",
      });
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Cure Failed",
        message: "Failed to remove active condition.",
        color: "red",
      });
    }
  };

  // Active conditions details modal trigger
  const handleOpenDetails = async (cond: string) => {
    setSelectedCondition(cond);
    setConditionDesc([]);
    setDetailsError(null);
    setLoadingDetails(true);
    setDetailsOpened(true);

    try {
      const result = await getCondition(cond);
      setConditionDesc(result);
      if (!result.length) {
        setDetailsError("No detailed description found.");
      }
    } catch (err) {
      console.error(err);
      setDetailsError("Failed to load condition details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRemoveFromModal = async () => {
    if (!selectedCondition) return;
    setRemovingDetails(true);
    try {
      removeCondition(selectedCondition);
      setDetailsOpened(false);
      await Promise.resolve();
      const updated = useCharacterStore.getState().character;
      if (updated) {
        await apiUpdateCharacter(updated);
      }
      showNotification({
        title: "Condition Removed",
        message: `Successfully cured "${selectedCondition.toUpperCase()}"!`,
        color: "green",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingDetails(false);
    }
  };

  // Construct meta text safely
  const metaItems = [character.race, character.characterClass, character.alignment].filter(Boolean);
  const metaString = metaItems.length > 0 ? metaItems.join(" • ") : "No details set";

  const conditionsCount = character.conditions?.length ?? 0;

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

              {/* NEW: Re-engineered Active Conditions Dropdown Bubble */}
              <Popover position="bottom-end" withArrow shadow="md" trapFocus={false}>
                <Popover.Target>
                  <div style={{ position: "relative" }}>
                    <Tooltip label="Active Conditions" position="top" withArrow>
                      <ActionBubble
                        label="Active Conditions"
                        icon={<IconFlame size={isMobile ? 24 : 28} />}
                        onClick={() => {}}
                        color="rgba(239, 68, 68, 0.25)"
                      />
                    </Tooltip>
                    
                    {conditionsCount > 0 && (
                      <Box
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--theme-color-accent-primary, #f59e0b)",
                          border: "1.5px solid #fff",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          pointerEvents: "none",
                          zIndex: 5,
                          boxShadow: "0 0 8px var(--theme-color-accent-primary, #f59e0b)",
                        }}
                      >
                        {conditionsCount}
                      </Box>
                    )}
                  </div>
                </Popover.Target>
                <Popover.Dropdown
                  style={{
                    background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.92))",
                    backdropFilter: "blur(24px) saturate(130%)",
                    WebkitBackdropFilter: "blur(24px) saturate(130%)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), var(--theme-glow-shadow-primary)",
                    padding: "16px",
                    color: "var(--theme-color-text-primary, #fff)",
                    minWidth: "260px",
                  }}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text
                        fw={700}
                        size="xs"
                        tt="uppercase"
                        style={{
                          letterSpacing: "2px",
                          color: "var(--theme-color-text-primary, #fff)",
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        Active Conditions
                      </Text>
                      <Button
                        size="xs"
                        variant="transparent"
                        onClick={() => setAddConditionOpened(true)}
                        style={{
                          color: "var(--theme-color-accent-primary, #f59e0b)",
                          fontWeight: 700,
                          fontSize: "11px",
                          padding: 0,
                          height: "auto",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        + Add
                      </Button>
                    </Group>

                    <Divider color="rgba(255, 255, 255, 0.08)" />

                    {conditionsCount > 0 ? (
                      <Stack gap="xs">
                        {character.conditions.map((cond, i) => (
                          <Group key={i} justify="space-between" align="center" wrap="nowrap" style={{
                            background: "rgba(255, 255, 255, 0.01)",
                            border: "1px solid rgba(255, 255, 255, 0.04)",
                            borderRadius: "8px",
                            padding: "6px 12px",
                          }}>
                            <Text
                              onClick={() => handleOpenDetails(cond)}
                              style={{
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                                fontFamily: "var(--font-sans)",
                                color: "var(--theme-color-accent-primary, #f59e0b)",
                                textDecoration: "underline",
                                textTransform: "uppercase",
                              }}
                            >
                              {cond}
                            </Text>
                            <ActionIcon
                              size="xs"
                              variant="transparent"
                              color="red"
                              onClick={() => handleRemoveCondition(cond)}
                              title={`Remove ${cond}`}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Stack>
                    ) : (
                      <Text size="xs" c="dimmed" style={{ fontStyle: "italic", textAlign: "center" }} py="xs">
                        No active conditions
                      </Text>
                    )}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Group>
        </Stack>
      </Box>

      {/* Modals */}
      <AddConditionModal opened={addConditionOpened} onClose={() => setAddConditionOpened(false)} />
      <HpModal opened={hpOpened} onClose={() => setHpOpened(false)} />
      <MoneyModal opened={moneyOpened} onClose={() => setMoneyOpened(false)} />
      <RollModal opened={rollOpened} onClose={() => setRollOpened(false)} />

      <ConditionDetailsModal
        opened={detailsOpened}
        onClose={() => setDetailsOpened(false)}
        title={selectedCondition ? selectedCondition.toUpperCase() : "Condition"}
        loading={loadingDetails}
        desc={conditionDesc}
        error={detailsError}
        onRemove={handleRemoveFromModal}
        saving={removingDetails}
      />
    </>
  );
}
