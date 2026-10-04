import { useState } from "react";
import { Avatar, Button, Group, TextInput } from "@mantine/core";
import { IconDeviceFloppy, IconPhoto } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterList, useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter as updateCharacterApi } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";
import { SettingsSection } from "@features/settings/SettingsSection";

/** Token artwork for one character. Mount with key={character.id} so the draft resets per character. */
export function TokenSection({ character }: { character: Character }) {
  const characters = useCharacterList();
  const current = useCurrentCharacter();
  const { setCharacters, setCharacter } = useCharacterCoreActions();

  const [draftUrl, setDraftUrl] = useState(character.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const isDirty = draftUrl.trim() !== (character.imageUrl ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateCharacterApi({ ...character, imageUrl: draftUrl.trim() });
      if (!saved) throw new Error("Save returned invalid character data.");

      setCharacters(characters.map((c) => (c.id === saved.id ? saved : c)));
      if (current?.id === saved.id) setCharacter(saved);

      showNotification({
        title: "Token URL Saved",
        message: `Successfully updated token image for ${character.name}.`,
        color: SectionColor.Green,
      });
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Failed to Save Token",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      icon={<IconPhoto size={20} color="var(--theme-color-accent-primary, #f59e0b)" />}
      title="Token"
      description="Artwork that represents this character on character lists, headers, and encounter maps."
    >
      <Group gap="md" wrap="wrap" align="center">
        <Avatar
          src={draftUrl || undefined}
          size={72}
          radius="md"
          style={{
            flexShrink: 0,
            border: "2px solid var(--theme-color-accent-primary, #f59e0b)",
            background: draftUrl ? "transparent" : "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {character.name.charAt(0).toUpperCase()}
        </Avatar>
        <Group gap="xs" wrap="nowrap" align="center" style={{ flex: "1 1 240px", minWidth: 0 }}>
          <TextInput
            placeholder="Image or Token URL (https://...)"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.currentTarget.value)}
            aria-label="Token image URL"
            style={{ flex: 1, minWidth: 0 }}
            styles={{
              input: {
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                color: "var(--theme-color-text-primary, #fff)",
                borderRadius: "8px",
                height: "36px",
                fontSize: "13px",
              },
            }}
          />
          <Button
            size="xs"
            onClick={handleSave}
            loading={saving}
            disabled={!isDirty}
            leftSection={<IconDeviceFloppy size={14} />}
            style={{
              height: "36px",
              borderRadius: "8px",
              background: isDirty ? "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))" : undefined,
              border: "none",
              color: isDirty ? "#fff" : undefined,
              boxShadow: isDirty ? "var(--theme-glow-shadow-primary)" : "none",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Save
          </Button>
        </Group>
      </Group>
    </SettingsSection>
  );
}
