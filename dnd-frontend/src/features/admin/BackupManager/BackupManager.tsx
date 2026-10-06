import { useToken } from "@store/auth/authSelectors";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconCloudDownload, IconCloudUpload, IconDatabase, IconLock, IconRefresh } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { exportCollection, exportAllCollections, restoreCollection } from "@services/backupService";
import { listCollections } from "@services/databaseService";
import { useIsMobile } from "@hooks/useIsMobile";
import { AdminPage, AdminPanel } from "@features/admin/components/AdminPage";

const DEFAULT_COLLECTIONS = ["Campaigns", "Characters", "Sessions", "Equipment", "Inventories", "Notes", "Spells", "Monsters"];

export function BackupManager() {
  const token = useToken()!;
  const [collectionName, setCollectionName] = useState("Campaigns");
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);
  const logPrefix = "[BackupManager]";
  const isMobile = useIsMobile();

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

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const names = await listCollections();
        if (names?.length) {
          setCollections(names);
          if (!collectionName && names[0]) setCollectionName(names[0]);
        }
      } catch (err) {
        console.error(logPrefix, "Failed to load collections", err);
        showNotification({
          title: "Could not fetch collections",
          message: "Using manual entry and presets instead.",
          color: SectionColor.Yellow,
        });
      }
    };
    void loadCollections();
  }, [token, collectionName]);

  const handleDownload = async () => {
    if (!validateCollection()) return;
    setDownloading(true);
    try {
      const result = await exportCollection(normalizedCollection);
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

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const result = await exportAllCollections();
      const blobUrl = URL.createObjectURL(result.blob);
      const fileName = result.fileName?.trim() || "backup.zip";
      const link = downloadLinkRef.current;
      if (link) {
        link.href = blobUrl;
        link.download = fileName;
        link.click();
      } else {
        const temp = document.createElement("a");
        temp.href = blobUrl;
        temp.download = fileName;
        temp.click();
      }
      URL.revokeObjectURL(blobUrl);
      showNotification({
        title: "All collections backup",
        message: `Downloaded ${fileName}`,
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
      const response = await restoreCollection(targetCollection, file);
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
    <AdminPage
      icon={IconCloudDownload}
      title="Backups"
      subtitle="Export any collection as a gzip archive, or restore one."
      actions={
        <>
          <Tooltip label="Reset to default" withArrow>
            <ActionIcon
              variant="default"
              size="lg"
              aria-label="Reset"
              onClick={() => {
                setCollectionName("Campaigns");
                setFile(null);
              }}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Button
            color="neon"
            leftSection={<IconCloudDownload size={16} />}
            loading={downloading}
            onClick={() => void handleDownloadAll()}
          >
            Backup all (zip)
          </Button>
        </>
      }
    >
      <AdminPanel icon={IconDatabase} title="Collection">
        <Stack gap="sm">
          <TextInput
            label="Collection name (locked)"
            placeholder="Auto-detected or choose below"
            value={collectionName}
            readOnly
            rightSection={<IconLock size={16} />}
            styles={{ input: { cursor: "not-allowed" } }}
            description={
              inferredCollectionFromFile
                ? `Detected from file: ${inferredCollectionFromFile}`
                : "Select a preset or upload a backup to set the collection."
            }
          />
          <Group gap="xs" wrap="wrap">
            {(collections.length ? collections : DEFAULT_COLLECTIONS).map((c) => (
              <Button
                key={c}
                size="xs"
                variant={normalizedCollection.toLowerCase() === c.toLowerCase() ? "filled" : "default"}
                color="neon"
                onClick={() => setCollectionName(c)}
                fullWidth={isMobile}
              >
                {c}
              </Button>
            ))}
          </Group>
        </Stack>
      </AdminPanel>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <AdminPanel icon={IconCloudDownload} title="Export collection">
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Generates a gzip archive of <b>{normalizedCollection || "the chosen collection"}</b>.
            </Text>
            <Button
              color="neon"
              variant="light"
              leftSection={<IconCloudDownload size={16} />}
              loading={downloading}
              onClick={() => void handleDownload()}
            >
              Download backup
            </Button>
            {downloading && <Progress size="sm" value={70} color="neon" striped animated />}
          </Stack>
        </AdminPanel>

        <AdminPanel icon={IconCloudUpload} title="Restore collection">
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Upload a .gz backup made here; the collection name is read from the file name.
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
            />
            <Button
              color="orange"
              variant="light"
              leftSection={<IconCloudUpload size={16} />}
              loading={uploading}
              disabled={!file}
              onClick={() => void handleRestore()}
            >
              Restore backup
            </Button>
            {uploading && <Progress size="sm" value={55} color="orange" striped animated />}
          </Stack>
        </AdminPanel>
      </SimpleGrid>

      {/* Hidden anchor for download fallback */}
      <a ref={downloadLinkRef} style={{ display: "none" }} />
    </AdminPage>
  );
}
