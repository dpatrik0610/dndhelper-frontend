import { useMemo, useState } from "react";
import { MultiSelect, Stack, Text } from "@mantine/core";
import type { ChronicleFolder, ChronicleVisibility } from "@appTypes/Chronicle";
import type { CampaignMemberView } from "@appTypes/Campaign";
import { BaseModal } from "@components/BaseModal";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import { CustomSelect } from "@components/common/CustomSelect";
import { showNotification } from "@components/Notification/Notification";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { folderPath, isDescendant } from "@features/chronicle/folderTree";

const ROOT = "__root";
const glassy = { input: "glassy-input", label: "glassy-label" };
const VISIBILITY = [
  { value: "Private", label: "Only DMs" },
  { value: "All", label: "All players" },
  { value: "Selected", label: "Some players" },
];

interface FolderModalProps {
  campaignId: string;
  folders: ChronicleFolder[];
  players: CampaignMemberView[];
  /** Null = a new folder. */
  folder: ChronicleFolder | null;
  parentId: string | null;
  onClose: () => void;
}

/** New folder, or rename / move an existing one. Mount with a fresh key per open. */
export function FolderModal({
  campaignId,
  folders,
  players,
  folder,
  parentId,
  onClose,
}: FolderModalProps) {
  const [name, setName] = useState(folder?.name ?? "");
  const [parent, setParent] = useState(folder?.parentId ?? parentId ?? ROOT);
  const [visibility, setVisibility] = useState<ChronicleVisibility>(
    folder?.visibility ?? "Private",
  );
  const [sharedWith, setSharedWith] = useState<string[]>(
    folder?.sharedWith ?? [],
  );
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () => [
      { value: ROOT, label: "(top level)" },
      ...folders
        .filter((f) => !folder || !isDescendant(f.id, folder.id, folders))
        .map((f) => ({ value: f.id, label: folderPath(f.id, folders) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [folders, folder],
  );

  const save = async () => {
    if (!name.trim()) {
      showNotification({ message: "Name the folder.", color: "red" });
      return;
    }
    setSaving(true);
    try {
      const input = {
        campaignId,
        name: name.trim(),
        parentId: parent === ROOT ? null : parent,
        visibility,
        sharedWith: visibility === "Selected" ? sharedWith : [],
      };
      const store = useChronicleStore.getState();
      if (folder) await store.updateFolder(folder.id, input);
      else await store.createFolder(input);
      onClose();
    } catch (error) {
      showNotification({
        title: "Could not save the folder",
        message: (error as Error).message,
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      opened
      onClose={onClose}
      title={folder ? "Edit folder" : "New folder"}
      size="sm"
      onSave={() => void save()}
      loading={saving}
    >
      <Stack gap="sm">
        <GlassyTextInput
          label="Name"
          placeholder="Sword Coast, Villains, Session prep..."
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
          }}
          maxLength={80}
          data-autofocus
        />
        <CustomSelect
          label="Inside"
          data={options}
          value={parent}
          onChange={(v) => setParent(v ?? ROOT)}
          searchable
          classNames={{ label: "glassy-label" }}
          comboboxProps={{ withinPortal: true }}
        />
        <CustomSelect
          label="Who can read it"
          data={VISIBILITY}
          value={visibility}
          onChange={(v) =>
            setVisibility((v as ChronicleVisibility) ?? "Private")
          }
          classNames={{ label: "glassy-label" }}
          comboboxProps={{ withinPortal: true }}
        />
        {visibility === "Selected" && (
          <MultiSelect
            label="Players"
            placeholder={
              players.length
                ? "Pick players"
                : "No players in this campaign yet"
            }
            data={players.map((p) => ({ value: p.userId, label: p.username }))}
            value={sharedWith}
            onChange={setSharedWith}
            searchable
            classNames={glassy}
            comboboxProps={{ withinPortal: true }}
          />
        )}
        {visibility !== "Private" && (
          <Text size="xs" c="dimmed">
            Every entry and subfolder inside it becomes readable, including ones
            you add later. Text inside %%...%% stays hidden.
          </Text>
        )}
      </Stack>
    </BaseModal>
  );
}
