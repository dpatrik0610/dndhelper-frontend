import { useState } from "react";
import { ActionIcon, Anchor, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

type UrlListEditorProps = {
  urls: string[];
  onChange: (next: string[]) => void;
};

export function UrlListEditor({ urls, onChange }: UrlListEditorProps) {
  const [pendingUrl, setPendingUrl] = useState("");

  const handleAdd = () => {
    const trimmed = pendingUrl.trim();
    if (!trimmed || urls.includes(trimmed)) {
      return;
    }

    onChange([...urls, trimmed]);
    setPendingUrl("");
  };

  return (
    <Stack gap="sm">
      <Group align="flex-end">
        <TextInput
          label="Extra image URL"
          placeholder="https://..."
          value={pendingUrl}
          onChange={(event) => setPendingUrl(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
          Add
        </Button>
      </Group>

      {urls.length > 0 ? (
        <Stack gap="xs">
          {urls.map((url) => (
            <Group key={url} justify="space-between" wrap="nowrap">
              <Anchor href={url} target="_blank" rel="noreferrer" truncate>
                {url}
              </Anchor>
              <ActionIcon color="red" variant="subtle" onClick={() => onChange(urls.filter((item) => item !== url))}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          No gallery images configured.
        </Text>
      )}
    </Stack>
  );
}
