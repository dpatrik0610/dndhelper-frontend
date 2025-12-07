import {
  ActionIcon,
  Button,
  Code,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconInfoCircle, IconUpload, IconX } from "@tabler/icons-react";
import { useRef } from "react";
import { BaseModal } from "@components/BaseModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { createManyEquipment } from "@services/equipmentService";
import { useAuthStore } from "@store/useAuthStore";
import { importSamplePretty } from "./ImportTemplate";

interface ImportModalProps {
  opened: boolean;
  payload: string;
  error: string;
  saving: boolean;
  onChangePayload: (value: string) => void;
  onError: (value: string) => void;
  onClose: () => void;
  onImported: () => Promise<void>;
}

export function ImportModal({
  opened,
  payload,
  error,
  saving,
  onChangePayload,
  onError,
  onClose,
  onImported,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBulkImport = async () => {
    onError("");
    const token = useAuthStore.getState().token;
    if (!token) {
      showNotification({ title: "Not authenticated", message: "Please login again.", color: SectionColor.Red });
      return;
    }

    try {
      const parsed = JSON.parse(payload);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        onError("Provide a non-empty JSON array of equipment.");
        return;
      }

      const invalid = parsed.findIndex(
        (item) => !item?.name || !item?.index || typeof item.isCustom !== "boolean" || typeof item.isDeleted !== "boolean"
      );
      if (invalid >= 0) {
        onError(`Invalid item at position ${invalid + 1}: requires name, index, isCustom, and isDeleted.`);
        return;
      }

      await createManyEquipment(parsed, token);
      showNotification({ title: "Items imported", message: `${parsed.length} equipment added.`, color: SectionColor.Green });
      onChangePayload("");
      onClose();
      await onImported();
    } catch (err) {
      onError(String(err));
    }
  };

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      onChangePayload(text);
      onError("");
    };
    reader.onerror = () => onError("Failed to read file");
    reader.readAsText(file);
  };

  return (
    <BaseModal
      opened={opened}
      onClose={() => {
        onClose();
        onError("");
      }}
      title=""
      showSaveButton={false}
      showCancelButton={false}
      withCloseButton={false}
      hideHeader
      size="lg"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Stack gap="md" p="sm" style={{ position: "relative" }}>
        <ActionIcon
          size="lg"
          variant="subtle"
          color="gray"
          onClick={onClose}
          style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,0.06)" }}
        >
          <IconX size={16} />
        </ActionIcon>

        <Group align="flex-start" gap="sm">
          <IconInfoCircle size={18} color="#9f9fff" style={{ marginTop: 2 }} />
          <Text size="sm" c="grape.1">
            Paste an array of equipment objects or upload a JSON file. We will validate and create them in bulk.
          </Text>
        </Group>

        <Textarea
          label="Equipment JSON array"
          placeholder="Paste your equipment JSON array here (see sample below)."
          minRows={8}
          autosize
          value={payload}
          onChange={(e) => onChangePayload(e.currentTarget.value ?? "")}
          styles={{
            input: {
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.15)",
            },
            label: { color: "white" },
          }}
        />

        <Stack gap={4}>
          <Text size="xs" c="grape.1">
            Quick sample
          </Text>
          <ScrollArea.Autosize mah={180} type="hover">
            <Code block color="grape" fz="xs">
              {importSamplePretty}
            </Code>
          </ScrollArea.Autosize>
        </Stack>

        {error && (
          <Text size="sm" c="red.4">
            {error}
          </Text>
        )}

        <Group justify="space-between" mt="xs">
          <Button variant="outline" color="blue" leftSection={<IconUpload size={14} />} onClick={handleFilePick}>
            Upload JSON
          </Button>
          <Group>
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button color="teal" loading={saving} onClick={() => void handleBulkImport()}>
              Import
            </Button>
          </Group>
        </Group>
      </Stack>
    </BaseModal>
  );
}

