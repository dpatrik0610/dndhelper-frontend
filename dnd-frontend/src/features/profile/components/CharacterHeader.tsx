import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Box, Group } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions, useCharacterCombatActions } from "@store/character/characterSelectors";
import { longrest, updateCharacter as apiUpdateCharacter } from "@services/characterService";
import { loadCharacters } from "@utils/loadCharacter";
import { useCharacterStore } from "@store/character/characterStore";
import { getCondition } from "@services/conditionService";

import { CharacterCurrencyArea } from "./CharacterCurrencyArea";
import { showNotification } from "@components/Notification/Notification";
import { SwitchCharacterButton } from "./SwitchCharacterButton";
import { useIsMobile } from "@hooks/useIsMobile";

import { AvatarHpCrest } from "./AvatarHpCrest";
import { TopPanel } from "./TopPanel";
import { IdentityPanel } from "./IdentityPanel";
import { ActionRibbonPanel } from "./ActionRibbonPanel";
import { HeaderModals } from "./HeaderModals";
import { InspirationBox } from "./InspirationBox";

export function CharacterHeader() {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const { removeCondition } = useCharacterCombatActions();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [addConditionOpened, setAddConditionOpened] = useState(false);
  const [hpOpened, setHpOpened] = useState(false);
  const [moneyOpened, setMoneyOpened] = useState(false);
  const [rollOpened, setRollOpened] = useState(false);

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
      });
    } catch (err) {
      showNotification({
        title: "Long rest failed",
        message: String(err),
        color: "red",
      });
    }
  }

  const handleRemoveCondition = async (cond: string) => {
    try {
      removeCondition(cond);
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
          <TopPanel character={character} isMobile={isMobile} />
          
          <Group wrap={isMobile ? "wrap" : "nowrap"} align="center" gap="xl" style={{ width: "100%" }}>
            <AvatarHpCrest character={character} isMobile={isMobile} />
            
            <IdentityPanel
              character={character}
              isMobile={isMobile}
              onUseInspiration={handleUseInspiration}
            />
            
            <Stack gap="xs" style={{ width: isMobile ? "100%" : "260px", flexShrink: 0 }}>
              <InspirationBox value={character.inspiration} onClick={handleUseInspiration} />
              <Box style={{ width: "100%", height: "auto", flexShrink: 0 }}>
                <CharacterCurrencyArea character={character} />
              </Box>
            </Stack>
          </Group>

          <ActionRibbonPanel
            character={character}
            conditionsCount={conditionsCount}
            onNavigate={navigate}
            onLongrest={handleLongrest}
            onOpenAddCondition={() => setAddConditionOpened(true)}
            onRemoveCondition={handleRemoveCondition}
            onOpenDetails={handleOpenDetails}
            onOpenRoll={() => setRollOpened(true)}
            onOpenHp={() => setHpOpened(true)}
            onOpenMoney={() => setMoneyOpened(true)}
          />
        </Stack>
      </Box>

      <HeaderModals
        addConditionOpened={addConditionOpened}
        onCloseAddCondition={() => setAddConditionOpened(false)}
        hpOpened={hpOpened}
        onCloseHp={() => setHpOpened(false)}
        moneyOpened={moneyOpened}
        onCloseMoney={() => setMoneyOpened(false)}
        rollOpened={rollOpened}
        onCloseRoll={() => setRollOpened(false)}
        detailsOpened={detailsOpened}
        onCloseDetails={() => setDetailsOpened(false)}
        selectedCondition={selectedCondition}
        loadingDetails={loadingDetails}
        conditionDesc={conditionDesc}
        detailsError={detailsError}
        onRemoveFromModal={handleRemoveFromModal}
        removingDetails={removingDetails}
      />
    </>
  );
}
