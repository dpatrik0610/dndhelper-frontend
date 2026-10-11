import { useState } from "react";
import { Avatar, Button, FileButton, Group, Text, TextInput } from "@mantine/core";
import { IconDeviceFloppy, IconPhoto, IconUpload } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterList, useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter as updateCharacterApi, uploadCharacterImage } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";
import { SettingsSection } from "@features/settings/SettingsSection";

const MAX_TOKEN_BYTES = 5 * 1024 * 1024;

/** Token artwork for one character. Mount with key={character.id} so the draft resets per character. */
export function TokenSection({ character }: { character: Character }) {
  const characters = useCharacterList();
  const current = useCurrentCharacter();
  const { setCharacters, setCharacter } = useCharacterCoreActions();

  const [draftUrl, setDraftUrl] = useState(character.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isDirty = draftUrl.trim() !== (character.imageUrl ?? "");

  const applySaved = (saved: Character) => {
    setCharacters(characters.map((c) => (c.id === saved.id ? saved : c)));
    if (current?.id === saved.id) setCharacter(saved);
  };

  // Upload saves straight away; pasting a URL still goes through Save.
  const handleUpload = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_TOKEN_BYTES) {
      showNotification({ title: "Image too large", message: "Token images can be at most 5 MB.", color: SectionColor.Red });
      return;
    }
    setUploading(true);
    try {
      const saved = await uploadCharacterImage(character.id!, file);
      applySaved(saved);
      setDraftUrl(saved.imageUrl ?? "");
      showNotification({
        title: "Token Uploaded",
        message: `Successfully updated token image for ${character.name}.`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({ title: "Upload failed", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await updateCharacterApi({ ...character, imageUrl: draftUrl.trim() });
      if (!saved) throw new Error("Save returned invalid character data.");

      applySaved(saved);

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
            placeholder="Paste an image URL (https://...) or upload"
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
          <FileButton onChange={handleUpload} accept="image/png,image/jpeg,image/webp,image/gif">
            {(props) => (
              <Button
                {...props}
                size="xs"
                variant="default"
                loading={uploading}
                leftSection={<IconUpload size={14} />}
                style={{ height: "36px", borderRadius: "8px", flexShrink: 0 }}
              >
                Upload
              </Button>
            )}
          </FileButton>
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
      <Text size="xs" c="dimmed" mt={6}>
        PNG, JPEG, WebP or GIF, up to 5 MB.
      </Text>
    </SettingsSection>
  );
}
