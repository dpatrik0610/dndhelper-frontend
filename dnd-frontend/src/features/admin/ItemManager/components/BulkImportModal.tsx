import React, { useRef, useState } from "react";
import {
  Group,
  Stack,
  Text,
  Button,
  Textarea,
  ScrollArea,
  Code,
  Collapse,
} from "@mantine/core";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { getAuthTokenSafe } from "@store/auth/authUtils";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { createManyEquipment } from "@services/equipmentService";
import {
  IconInfoCircle,
  IconUpload,
  IconCheck,
  IconClipboardCopy,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { importSamplePretty } from "./ImportTemplate";
import styles from "@features/admin/ItemManager/ItemManager.module.css";

interface BulkImportModalProps {
  opened: boolean;
  onClose: () => void;
  onImported: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ opened, onClose, onImported }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSample, setShowSample] = useState(false);

  const handleBulkImport = async () => {
    setError(null);
    const token = getAuthTokenSafe();
    if (!token) {
      showNotification({
        title: "Authentication Required",
        message: "You must be logged in to import equipment.",
        color: SectionColor.Red,
      });
      return;
    }

    if (!payload.trim()) {
      setError("Please paste a JSON array or upload a JSON file.");
      return;
    }

    try {
      const parsed = JSON.parse(payload);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setError("Provide a non-empty JSON array of equipment.");
        return;
      }

      // Quick validate
      const invalid = parsed.findIndex((item) => !item?.name);
      if (invalid >= 0) {
        setError(`Invalid item at index ${invalid}: 'name' is a required field.`);
        return;
      }

      setSaving(true);

      // Map indices if missing
      const sanitized = parsed.map((item) => ({
        ...item,
        index: item.index || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        isCustom: item.isCustom ?? true,
        isDeleted: item.isDeleted ?? false,
      }));

      await createManyEquipment(sanitized);
      showNotification({
        title: "Import Successful",
        message: `Successfully imported ${parsed.length} equipment item(s).`,
        color: SectionColor.Green,
      });
      setPayload("");
      onClose();
      onImported();
    } catch (err) {
      setError(`JSON Parsing Failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? "";
      setPayload(text);
      setError(null);
      showNotification({
        title: "File Loaded",
        message: `Successfully read "${file.name}"`,
        color: SectionColor.Green,
      });
    };
    reader.onerror = () => {
      setError("Failed to read selected file.");
    };
    reader.readAsText(file);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(importSamplePretty);
    showNotification({
      title: "Copied!",
      message: "Sample JSON copied to clipboard.",
      color: SectionColor.Green,
    });
  };

  return (
    <AdminGlassModal opened={opened} onClose={onClose} title="Bulk Import Equipment" size="lg">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Stack gap="md" p="xs">
        <Group align="flex-start" gap="xs" p="sm" style={{ background: "rgba(168, 85, 247, 0.08)", borderRadius: "8px", border: "1px solid rgba(168, 85, 247, 0.2)" }}>
          <IconInfoCircle size={20} color="#c084fc" style={{ marginTop: 2, flexShrink: 0 }} />
          <Text size="sm" c="purple.1">
            Bulk upload multiple equipment items at once. You can upload a <code>.json</code> file or paste a JSON array formatted with item properties. Missing <code>index</code> attributes will be auto-generated.
          </Text>
        </Group>

        <Textarea
          label="Equipment JSON Array"
          placeholder="Paste JSON array here..."
          minRows={10}
          autosize
          value={payload}
          onChange={(e) => {
            setPayload(e.currentTarget.value ?? "");
            setError(null);
          }}
          className={`${styles.jsonTextarea} ${error ? styles.jsonError : ""}`}
          styles={{
            input: { background: "rgba(10, 10, 15, 0.8) !important", border: "1px solid rgba(255, 255, 255, 0.1) !important" }
          }}
        />

        {error && (
          <Text size="sm" c="red.4" fw={500}>
            ⚠️ Error: {error}
          </Text>
        )}

        {/* Expandable Sample */}
        <Stack gap={4}>
          <Button
            variant="subtle"
            color="dimmed"
            size="xs"
            onClick={() => setShowSample(!showSample)}
            rightSection={showSample ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            justify="space-between"
            fullWidth
          >
            Show Quick Sample Array
          </Button>

          <Collapse in={showSample}>
            <Stack gap={6} mt="xs" p="xs" style={{ background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
              <Group justify="space-between">
                <Text size="xs" c="teal.3" fw={600}>Sample Structure</Text>
                <Button size="xs" variant="outline" color="teal" leftSection={<IconClipboardCopy size={12} />} onClick={handleCopySample}>
                  Copy Sample
                </Button>
              </Group>
              <ScrollArea.Autosize mah={180} type="hover">
                <Code block color="grape" fz="xs" style={{ background: "transparent" }}>
                  {importSamplePretty}
                </Code>
              </ScrollArea.Autosize>
            </Stack>
          </Collapse>
        </Stack>

        <Group justify="space-between" mt="md">
          <Button
            className={`${styles.neonButton} ${styles.neonCyan}`}
            leftSection={<IconUpload size={16} />}
            onClick={handleFilePick}
          >
            Upload JSON File
          </Button>
          <Group gap="sm">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={`${styles.neonButton} ${styles.neonGreen}`}
              loading={saving}
              onClick={handleBulkImport}
              leftSection={<IconCheck size={16} />}
            >
              Import All
            </Button>
          </Group>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
};
