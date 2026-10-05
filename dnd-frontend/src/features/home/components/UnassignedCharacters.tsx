import { useEffect, useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { IconDoorEnter } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import { getUnassignedCharacters } from "@services/characterService";
import { addCharacterToCampaign } from "@services/campaignService";
import { useCurrentCampaign } from "@store/campaign/campaignSelectors";
import { loadCharacters } from "@utils/loadCharacter";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

/**
 * My characters that aren't in any campaign (left it, or were kicked along with me), with a button to
 * bring each into the current campaign. Renders nothing when there are none.
 */
export function UnassignedCharacters({ opened }: { opened: boolean }) {
  const campaign = useCurrentCampaign();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    getUnassignedCharacters().then(setCharacters).catch(() => setCharacters([]));
  }, [opened]);

  if (characters.length === 0) return null;

  const bringIn = async (character: Character) => {
    if (!campaign || !character.id) return;
    setBusy(character.id);
    try {
      await addCharacterToCampaign(campaign.id, character.id);
      setCharacters((list) => list.filter((c) => c.id !== character.id));
      await loadCharacters();
      showNotification({ title: "Character joined", message: `${character.name} is now in ${campaign.name}.`, color: SectionColor.Green });
    } catch (err) {
      showNotification({ title: "Couldn't bring them in", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Stack gap={6} mt="md" pt="sm" style={{ borderTop: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))" }}>
      <Text size="xs" fw={700} tt="uppercase" c="var(--theme-color-text-secondary)" style={{ letterSpacing: 1 }}>
        Not in a campaign
      </Text>
      {characters.map((c) => (
        <Group key={c.id} justify="space-between" wrap="nowrap" gap="sm">
          <Text fw={600} truncate style={{ minWidth: 0 }}>
            {c.name}
            <Text span size="sm" c="dimmed"> · Lvl {c.level} {c.characterClass ?? ""}</Text>
          </Text>
          <Button
            size="compact-sm"
            variant="light"
            leftSection={<IconDoorEnter size={14} />}
            disabled={!campaign}
            loading={busy === c.id}
            onClick={() => void bringIn(c)}
          >
            {campaign ? `Bring into ${campaign.name}` : "Pick a campaign first"}
          </Button>
        </Group>
      ))}
    </Stack>
  );
}
