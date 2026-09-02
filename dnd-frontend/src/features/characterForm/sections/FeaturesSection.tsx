import {
  Group,
  Stack,
  TextInput,
  Textarea,
  Button,
  Text,
  Box,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { useState, useMemo } from "react";
import {
  IconPlus,
  IconCheck,
  IconBookmark,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { useCharacterFormStore } from "@store/character/characterFormStore";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { MarkdownRenderer } from "@components/MarkdownRender";

export function FeaturesSection({ noBox = false }: { noBox?: boolean }) {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  const features = useMemo(() => characterForm.features ?? [], [characterForm.features]);

  // Edit/Builder States
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [featureName, setFeatureName] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");

  const handleSave = () => {
    if (!featureName.trim()) return;

    const newFeature = {
      name: featureName.trim(),
      description: featureDesc.trim(),
    };

    let updated = [...features];
    if (isEditing !== null) {
      updated[isEditing] = newFeature;
      setIsEditing(null);
    } else {
      updated = [...updated, newFeature];
    }

    setCharacterForm({ features: updated });
    setFeatureName("");
    setFeatureDesc("");
  };

  const handleDelete = (index: number) => {
    const updated = [...features];
    updated.splice(index, 1);
    setCharacterForm({ features: updated });

    if (isEditing === index) {
      setIsEditing(null);
      setFeatureName("");
      setFeatureDesc("");
    }
  };

  const content = (
    <Stack gap="lg">
      
      {/* 🛠️ SPECIAL FEATURES BUILDER */}
      <Box
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <Stack gap="sm">
          <Group gap={6} mb="xs">
            <IconBookmark size={16} style={{ color: "var(--theme-color-accent-primary)" }} />
            <Text
              className="narrative-title"
              style={{
                fontSize: "12px",
                letterSpacing: "1.5px",
                color: "var(--theme-color-text-primary, #fff)",
              }}
            >
              {isEditing !== null ? "Edit Feature Details" : "Create Special Feature / Feat"}
            </Text>
          </Group>

          <Divider color="rgba(255,255,255,0.03)" mb="xs" />

          {/* Feature Name Input */}
          <TextInput
            label="Feature Name"
            placeholder="e.g. Action Surge, War Caster"
            value={featureName}
            onChange={(e) => setFeatureName(e.currentTarget.value)}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />

          {/* Large Description Textarea (Supports Markdown) */}
          <Textarea
            label="Feature Description (Supports Markdown)"
            placeholder="Describe the feature details... You can use bullet points, bold (**text**), italics (*text*), and headers (# text)!"
            value={featureDesc}
            onChange={(e) => setFeatureDesc(e.currentTarget.value)}
            minRows={5}
            autosize
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />

          {/* Builder Controls */}
          <Group justify="flex-end" gap="sm" mt="xs">
            {isEditing !== null && (
              <Button
                variant="unstyled"
                className="glass-btn-secondary"
                onClick={() => {
                  setIsEditing(null);
                  setFeatureName("");
                  setFeatureDesc("");
                }}
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  height: "36px",
                  padding: "0 16px",
                }}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              className="glass-btn-primary"
              onClick={handleSave}
              disabled={!featureName.trim()}
              leftSection={isEditing !== null ? <IconCheck size={14} /> : <IconPlus size={14} />}
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "10px",
                height: "36px",
                padding: "0 16px",
              }}
            >
              {isEditing !== null ? "Save Feature" : "Add Feature"}
            </Button>
          </Group>
        </Stack>
      </Box>

      {/* 📜 CURRENT FEATURES DISPLAY LIST (Mirrors profile panel card design) */}
      <Stack gap="sm">
        <Text
          className="narrative-title"
          style={{
            fontSize: "11px",
            letterSpacing: "2px",
            color: "var(--theme-color-text-secondary)",
            paddingLeft: "4px",
          }}
        >
          Current Features List ({features.length})
        </Text>

        {!features.length ? (
          <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.4))", fontStyle: "italic" }} pl="xs">
            No features added yet.
          </Text>
        ) : (
          <Stack gap="md">
            {features.map((f, i) => {
              const hasDesc = !!f.description;

              return (
                <Box
                  key={i}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1.5px)";
                    e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2), var(--theme-glow-shadow-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  style={{
                    transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    background: "var(--theme-bg-card, rgba(255, 255, 255, 0.02))",
                    borderRadius: "0 12px 12px 0",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                    borderLeft: "4px solid var(--theme-color-accent-primary, #f59e0b)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <ExpandableSection
                    title={f.name}
                    titleContent={
                      <Group justify="space-between" align="center" style={{ flex: 1, minWidth: 0, paddingRight: "8px" }} wrap="nowrap">
                        <Text
                          fw={300}
                          size="sm"
                          truncate="end"
                          style={{
                            textTransform: "uppercase",
                            color: "var(--theme-color-text-primary, #fff)",
                            letterSpacing: "3px",
                            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                          }}
                        >
                          {f.name}
                        </Text>

                        {/* Edit and Delete controls inline inside title */}
                        <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                          <ActionIcon
                            size="md"
                            variant="subtle"
                            color="blue"
                            aria-label={`Edit ${f.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditing(i);
                              setFeatureName(f.name);
                              setFeatureDesc(f.description ?? "");
                              // Scroll form panel back to builder card safely
                              const formCard = document.querySelector(".glass-panel");
                              formCard?.scrollIntoView({ behavior: "smooth" });
                            }}
                          >
                            <IconPencil size={15} />
                          </ActionIcon>
                          <ActionIcon
                            size="md"
                            variant="subtle"
                            color="red"
                            aria-label={`Delete ${f.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(i);
                            }}
                          >
                            <IconTrash size={15} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    }
                    color={SectionColor.Grape}
                    expandable={hasDesc}
                    defaultOpen={false}
                    padding="sm"
                    marginTop={0}
                    marginBottom={0}
                    style={{
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                    }}
                  >
                    {f.description && (
                      <MarkdownRenderer
                        content={f.description}
                        textColor="rgba(255, 255, 255, 0.85)"
                      />
                    )}
                  </ExpandableSection>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>

    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection
      title="Features & Feats"
      icon={<IconBookmark />}
      color={SectionColor.Grape}
      defaultOpen
    >
      {content}
    </ExpandableSection>
  );
}
