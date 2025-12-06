import { useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  FileInput,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowUpRight, IconCloudDownload, IconCloudUpload, IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";
import { SectionColor } from "../../../types/SectionColor";
import { exportCollection, restoreCollection } from "../../../services/backupService";

const popularCollections = [
  "Campaigns",
  "Characters",
  "Sessions",
  "Equipment",
  "Inventories",
  "Notes",
  "Spells",
  "Monsters",
];

export function BackupManager() {
  const token = useAuthStore((s) => s.token)!;
  const [collectionName, setCollectionName] = useState("Campaigns");
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const logPrefix = "[BackupManager]";

  const normalizedCollection = useMemo(() => collectionName.trim(), [collectionName]);

  const inferredCollectionFromFile = useMemo(() => {
    if (!file?.name) return "";
    const base = file.name.replace(/\.gz$/i, "").replace(/\.gzip$/i, "");
    return base.trim();
  }, [file]);

  const validateCollection = () => {
    const target = normalizedCollection || inferredCollectionFromFile;
    if (!target) {
      showNotification({
        title: "Collection required",
        message: "Enter a collection name to continue.",
        color: SectionColor.Red,
      });
      return false;
    }
    if (!normalizedCollection && inferredCollectionFromFile) {
      setCollectionName(inferredCollectionFromFile);
    }
    return true;
  };

  const handleDownload = async () => {
    if (!validateCollection()) return;
    setDownloading(true);
    try {
      const result = await exportCollection(normalizedCollection, token);
      console.info(logPrefix, "Export success", {
        collection: normalizedCollection,
        fileName: result.fileName,
        contentType: result.contentType,
      });
      const blobUrl = URL.createObjectURL(result.blob);
      const link = downloadLinkRef.current;
      if (link) {
        link.href = blobUrl;
        link.download = result.fileName;
        link.click();
      } else {
        const temp = document.createElement("a");
        temp.href = blobUrl;
        temp.download = result.fileName;
        temp.click();
      }
      console.debug(logPrefix, "Triggering download", { href: blobUrl, fileName: result.fileName });
      URL.revokeObjectURL(blobUrl);

      showNotification({
        title: "Export ready",
        message: `Downloaded ${result.fileName}`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Export failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRestore = async () => {
    const targetCollection = normalizedCollection || inferredCollectionFromFile;
    if (!targetCollection || !validateCollection()) return;
    if (!file) {
      showNotification({
        title: "File required",
        message: "Upload a .gz backup file to restore.",
        color: SectionColor.Red,
      });
      return;
    }
    setUploading(true);
    try {
      const response = await restoreCollection(targetCollection, file, token);
      console.info(logPrefix, "Restore success", {
        collection: targetCollection,
        fileName: file.name,
        response,
      });
      showNotification({
        title: "Restore complete",
        message: response.message ?? `Restored ${targetCollection}`,
        color: SectionColor.Green,
      });
      setFile(null);
    } catch (err) {
      console.error(logPrefix, "Restore failed", { collection: targetCollection, error: err });
      showNotification({
        title: "Restore failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper
      p="xl"
      radius="md"
      withBorder
      style={{
        background: "linear-gradient(135deg, rgba(20, 10, 40, 0.8), rgba(15, 8, 35, 0.7))",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Group justify="space-between" align="flex-start" mb="lg">
        <Stack gap={4}>
          <Group gap="xs">
            <IconCloudDownload size={24} color="#b197fc" />
            <Title order={3} c="gray.0">
              Backup & Restore
            </Title>
          </Group>
          <Text size="sm" c="grape.1">
            Export any collection as a gzip archive or restore from a previous backup.
          </Text>
        </Stack>
        <Tooltip label="Reset to default">
          <ActionIcon
            variant="subtle"
            color="grape"
            onClick={() => {
              setCollectionName("Campaigns");
              setFile(null);
            }}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Stack gap="md">
        <TextInput
          label="Collection name"
          placeholder="e.g. Campaigns"
          value={collectionName}
          onChange={(e) => setCollectionName(e.currentTarget.value)}
          rightSection={<IconInfoCircle size={16} color="#b197fc" />}
          styles={{
            input: { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" },
            label: { color: "white" },
          }}
          description={
            inferredCollectionFromFile
              ? `Detected from file: ${inferredCollectionFromFile}`
              : "The backup controller expects the collection name used by the server."
          }
        />

        <Group gap="xs" wrap="wrap">
          {popularCollections.map((c) => (
            <Button
              key={c}
              size="xs"
              variant={normalizedCollection.toLowerCase() === c.toLowerCase() ? "filled" : "outline"}
              color="grape"
              onClick={() => setCollectionName(c)}
              leftSection={<IconArrowUpRight size={14} />}
            >
              {c}
            </Button>
          ))}
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="sm">
          <Card
            withBorder
            padding="lg"
            radius="md"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Stack gap="sm">
              <Group gap="xs">
                <IconCloudDownload size={18} color="#8ce99a" />
                <Text fw={600}>Export collection</Text>
              </Group>
              <Text size="sm" c="dimmed">
                Generates a gzip archive for the chosen collection.
              </Text>
              <Button
                color="teal"
                leftSection={<IconCloudDownload size={16} />}
                loading={downloading}
                onClick={() => void handleDownload()}
              >
                Download backup
              </Button>
              {downloading && <Progress size="sm" value={70} color="teal" striped animated />}
            </Stack>
          </Card>

          <Card
            withBorder
            padding="lg"
            radius="md"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <Stack gap="sm">
              <Group gap="xs">
                <IconCloudUpload size={18} color="#74c0fc" />
                <Text fw={600}>Restore collection</Text>
              </Group>
              <Text size="sm" c="dimmed">
                Upload a .gz backup created from this dashboard to restore the collection. We will auto-detect the
                collection name from the file name.
              </Text>
              <FileInput
                accept=".gz,application/gzip"
                placeholder="Select .gz backup"
                value={file}
                onChange={(selected) => {
                  setFile(selected);
                  if (selected?.name) {
                    const inferred = selected.name.replace(/\.gz$/i, "").replace(/\.gzip$/i, "").trim();
                    if (inferred) setCollectionName(inferred);
                  }
                }}
                clearable
                styles={{
                  input: { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" },
                }}
              />
              <Button
                color="blue"
                leftSection={<IconCloudUpload size={16} />}
                loading={uploading}
                disabled={!file}
                onClick={() => void handleRestore()}
              >
                Restore backup
              </Button>
              {uploading && <Progress size="sm" value={55} color="blue" striped animated />}
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>

      {/* Hidden anchor for download fallback */}
      <a ref={downloadLinkRef} style={{ display: "none" }} />
    </Paper>
  );
}
