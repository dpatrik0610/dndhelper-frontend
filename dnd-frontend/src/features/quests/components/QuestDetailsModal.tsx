import { useState } from "react";
import { Box, Group, Text, Stack, Button, Divider, TextInput, NumberInput } from "@mantine/core";
import { IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import type { Quest, QuestObjective } from "@appTypes/Quest";
import { BaseModal } from "@components/BaseModal";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { QuestObjectiveItem } from "./QuestObjectiveItem";
import { QuestRewards } from "./QuestRewards";
import { QuestCardHeader } from "./QuestCardHeader";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { ExpandableSection } from "@components/ExpandableSection";

interface QuestDetailsModalProps {
  quest: Quest | null;
  opened: boolean;
  onClose: () => void;
  isPersonal: boolean;
  onAddObjective: (questId: string, description: string, threshold: number, progress: number) => Promise<void>;
  onEditObjective: (questId: string, obj: QuestObjective) => Promise<void>;
  onDeleteObjective: (questId: string, objectiveId: string) => Promise<void>;
  onToggleObjective: (questId: string, obj: QuestObjective) => Promise<void>;
  onAdjustProgress: (questId: string, obj: QuestObjective, amount: number) => Promise<void>;
  onViewEquipment: (equipmentId: string) => void;
}

export function QuestDetailsModal({
  quest,
  opened,
  onClose,
  isPersonal,
  onAddObjective,
  onEditObjective,
  onDeleteObjective,
  onToggleObjective,
  onAdjustProgress,
  onViewEquipment,
}: QuestDetailsModalProps) {
  // Inline Objective Form State
  const [showForm, setShowForm] = useState(false);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [objectiveDesc, setObjectiveDesc] = useState("");
  const [objectiveThreshold, setObjectiveThreshold] = useState(1);
  const [objectiveProgress, setObjectiveProgress] = useState(0);
  const [loadingInline, setLoadingInline] = useState(false);

  if (!quest) return null;

  const handleOpenNewForm = () => {
    setEditingObjectiveId(null);
    setObjectiveDesc("");
    setObjectiveThreshold(1);
    setObjectiveProgress(0);
    setShowForm(true);
  };

  const handleEditClick = (questId: string, obj: QuestObjective) => {
    setEditingObjectiveId(obj.id);
    setObjectiveDesc(obj.description || "");
    setObjectiveThreshold(obj.completionThreshold);
    setObjectiveProgress(obj.currentProgress);
    setShowForm(true);
  };

  const handleSaveInlineObjective = async () => {
    if (!objectiveDesc.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Objective goal description is required.",
        color: SectionColor.Red,
      });
      return;
    }

    setLoadingInline(true);
    try {
      if (editingObjectiveId) {
        const updatedObj: QuestObjective = {
          id: editingObjectiveId,
          description: objectiveDesc,
          completionThreshold: objectiveThreshold,
          currentProgress: objectiveProgress,
          isCompleted: objectiveProgress >= objectiveThreshold,
        };
        await onEditObjective(quest.id || "", updatedObj);
      } else {
        await onAddObjective(quest.id || "", objectiveDesc, objectiveThreshold, objectiveProgress);
      }
      setShowForm(false);
      setObjectiveDesc("");
      setObjectiveThreshold(1);
      setObjectiveProgress(0);
      setEditingObjectiveId(null);
    } catch (err) {
      showNotification({
        title: "Error Saving Objective",
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        color: SectionColor.Red,
      });
    } finally {
      setLoadingInline(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={"Quest"}
      size="xl"
      showSaveButton={false}
    >
      <Stack gap="md">
        {/* Header Block */}
        <QuestCardHeader
          title={quest.title}
          type={quest.type}
          status={quest.status}
          location={quest.location}
          isPersonal={false} // Header action icons are already in the card
        />

        <Divider style={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

        {/* Full Markdown Description In Expandable Section*/}
        {quest.description ? (
          <ExpandableSection 
            title="Details"
            defaultOpen={true}
            padding="md"
            marginTop="sm"
            marginBottom="sm"
            style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))", borderRadius: "8px" }}
          >
          <MarkdownRenderer content={quest.description} />
          </ExpandableSection>
        ) : (
          <Text size="sm" c="rgba(255, 255, 255, 0.4)" fs="italic">
            No description has been recorded for this quest.
          </Text>
        )}

        <Divider style={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

        {/* Objectives Section */}
        <Box>
          <Group justify="space-between" align="center" mb="sm">
            <Text
              size="xs"
              fw={600}
              tt="uppercase"
              style={{
                letterSpacing: "1px",
                color: "var(--theme-color-text-primary, #fff)",
              }}
            >
              Objectives Checklists
            </Text>
            {isPersonal && !showForm && (
              <Button
                size="xs"
                variant="subtle"
                leftSection={<IconPlus size={12} />}
                onClick={handleOpenNewForm}
                styles={{
                  root: {
                    color: "var(--theme-color-accent-primary, #f59e0b)",
                  },
                }}
              >
                Add Objective
              </Button>
            )}
          </Group>

          {/* Objectives List */}
          {quest.objectives.length === 0 && !showForm ? (
            <Text size="xs" c="var(--theme-color-text-secondary, rgba(255,255,255,0.5))" fs="italic">
              No objectives recorded.
            </Text>
          ) : (
            <Stack gap="xs" mb={showForm ? "md" : 0}>
              {quest.objectives.map((obj) => (
                <QuestObjectiveItem
                  key={obj.id}
                  obj={obj}
                  questId={quest.id || ""}
                  isPersonal={isPersonal}
                  onToggle={onToggleObjective}
                  onAdjustProgress={onAdjustProgress}
                  onEdit={handleEditClick} // hijacked edit callback to open inside the inline details form!
                  onDelete={onDeleteObjective}
                />
              ))}
            </Stack>
          )}

          {/* Inline Add/Edit Form */}
          {showForm && (
            <Box
              p="md"
              style={{
                background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.4))",
                border: "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.25))",
                boxShadow: "var(--theme-glow-shadow-primary)",
                borderRadius: "8px",
              }}
            >
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                c="var(--theme-color-accent-primary)"
                mb="md"
                style={{ letterSpacing: "1px" }}
              >
                {editingObjectiveId ? "Edit Objective" : "New Objective"}
              </Text>
              <Stack gap="md">
                <TextInput
                  label="Objective Goal"
                  placeholder="e.g. Gather 5 shadow herbs"
                  required
                  value={objectiveDesc}
                  onChange={(e) => {
                    const val = e.currentTarget.value;
                    setObjectiveDesc(val);
                  }}
                  styles={{
                    label: { color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" },
                    input: { background: "rgba(255,255,255,0.02)", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))", color: "white" },
                  }}
                />
                <Group grow>
                  <NumberInput
                    label="Completion Goal"
                    description="Target amount (set to 1 for simple checklists)"
                    min={1}
                    value={objectiveThreshold}
                    onChange={(val) => setObjectiveThreshold(Number(val) || 1)}
                    styles={{
                      label: { color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" },
                      description: { fontSize: "10px", color: "rgba(255,255,255,0.4)" },
                      input: { background: "rgba(255,255,255,0.02)", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))", color: "white" },
                      control: { borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" },
                    }}
                  />
                  <NumberInput
                    label="Starting Progress"
                    description="Initial starting progress count"
                    min={0}
                    max={objectiveThreshold}
                    value={objectiveProgress}
                    onChange={(val) => setObjectiveProgress(Number(val) || 0)}
                    styles={{
                      label: { color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" },
                      description: { fontSize: "10px", color: "rgba(255,255,255,0.4)" },
                      input: { background: "rgba(255,255,255,0.02)", border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))", color: "white" },
                      control: { borderLeft: "1px solid rgba(255,255,255,0.08)", borderRight: "1px solid rgba(255,255,255,0.08)" },
                    }}
                  />
                </Group>

                <Group justify="flex-end" gap="sm" mt="xs">
                  <Button
                    size="xs"
                    variant="subtle"
                    onClick={() => setShowForm(false)}
                    disabled={loadingInline}
                    leftSection={<IconX size={12} />}
                    styles={{ root: { color: "var(--theme-color-text-secondary)" } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    className="glass-btn-primary"
                    onClick={handleSaveInlineObjective}
                    loading={loadingInline}
                    disabled={loadingInline}
                    leftSection={<IconCheck size={12} />}
                  >
                    Save Objective
                  </Button>
                </Group>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Rewards Section */}
        <QuestRewards
          rewardCurrencies={quest.rewardCurrencies}
          rewardItemIds={quest.rewardItemIds}
          onViewEquipment={onViewEquipment}
        />
      </Stack>
    </BaseModal>
  );
}
