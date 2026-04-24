import {
  ActionIcon,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconDeviceFloppy, IconPlus, IconRefresh, IconX, IconTrash } from "@tabler/icons-react";

export function AssistantSettings({ controller }: any) {
  const {
    settingsOpen,
    setSettingsOpen,
    draftConfig,
    setDraftConfig,
    resetConfig,
    save,
  } = controller;

  function update(next: any) {
    setDraftConfig(next);
  }

  return (
    <Modal
      opened={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      withCloseButton={false}
      centered
      size="xl"
      overlayProps={{ blur: 8, opacity: 0.55 }}
      styles={{
        content: {
          background: "rgba(20, 18, 40, 0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        },
      }}
    >

      {/* HEADER ROW (full width close button) */}
      <Group
        justify="space-between"
        align="center"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: 8,
          background: "rgba(20, 18, 40, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Text fw={700}>Assistant Settings</Text>
        <ActionIcon
          onClick={() => setSettingsOpen(false)}
          variant="light"
          color="gray"
          size="lg"
        >
          <IconX size={18} />
        </ActionIcon>
      </Group>

      <Stack gap="lg">
        <Divider color="rgba(255,255,255,0.08)" />
        <Group justify="space-between">
          <div></div>
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              color="yellow"
              leftSection={<IconRefresh size={14} />}
              onClick={resetConfig}
            >
              Reset
            </Button>

            <Button
              size="xs"
              leftSection={<IconDeviceFloppy size={14} />}
              onClick={save}
            >
              Save
            </Button>
          </Group>
        </Group>

        <Select
          label="Default Model"
          value={draftConfig.defaultModelId}
          data={draftConfig.models.map((m: any) => ({
            value: m.id,
            label: m.label || m.id,
          }))}
          onChange={(v) =>
            v && update({ ...draftConfig, defaultModelId: v })
          }
          classNames={{ input: "glassy-input" }}
        />

        {/* MODELS */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Models</Text>
            <ActionIcon
              variant="light"
              onClick={() =>
                update({
                  ...draftConfig,
                  models: [...draftConfig.models, { id: "", label: "" }],
                })
              }
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>

          {draftConfig.models.map((m: any, i: number) => (
            <Paper
              key={i}
              p="sm"
              radius="md"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <Grid>
                <Grid.Col span={5}>
                  <TextInput
                    label="Id"
                    value={m.id}
                    classNames={{ input: "glassy-input" }}
                    onChange={(e) =>
                      update({
                        ...draftConfig,
                        models: draftConfig.models.map((x: any, idx: number) =>
                          idx === i ? { ...x, id: e.currentTarget.value } : x
                        ),
                      })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={6}>
                  <TextInput
                    label="Label"
                    value={m.label}
                    classNames={{ input: "glassy-input" }}
                    onChange={(e) =>
                      update({
                        ...draftConfig,
                        models: draftConfig.models.map((x: any, idx: number) =>
                          idx === i ? { ...x, label: e.currentTarget.value } : x
                        ),
                      })
                    }
                  />
                </Grid.Col>

                <Grid.Col span={1}>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() =>
                      update({
                        ...draftConfig,
                        models: draftConfig.models.filter(
                          (_: any, idx: number) => idx !== i
                        ),
                      })
                    }
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Grid.Col>
              </Grid>
            </Paper>
          ))}
        </Stack>

        {/* CATEGORIES */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Categories</Text>
            <ActionIcon
              variant="light"
              onClick={() =>
                update({
                  ...draftConfig,
                  categories: [
                    ...draftConfig.categories,
                    { id: "", label: "" },
                  ],
                })
              }
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>

          {draftConfig.categories.map((c: any, i: number) => (
            <Group key={i} grow>
              <TextInput
                label="Id"
                value={c.id}
                classNames={{ input: "glassy-input" }}
                onChange={(e) =>
                  update({
                    ...draftConfig,
                    categories: draftConfig.categories.map(
                      (x: any, idx: number) =>
                        idx === i ? { ...x, id: e.currentTarget.value } : x
                    ),
                  })
                }
              />

              <TextInput
                label="Label"
                value={c.label}
                classNames={{ input: "glassy-input" }}
                onChange={(e) =>
                  update({
                    ...draftConfig,
                    categories: draftConfig.categories.map(
                      (x: any, idx: number) =>
                        idx === i ? { ...x, label: e.currentTarget.value } : x
                    ),
                  })
                }
              />

              <ActionIcon
                color="red"
                variant="light"
                mt={24}
                onClick={() =>
                  update({
                    ...draftConfig,
                    categories: draftConfig.categories.filter(
                      (_: any, idx: number) => idx !== i
                    ),
                  })
                }
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>

      {/* TOPICS */}
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={600}>Topics</Text>
          <ActionIcon
            variant="light"
            onClick={() =>
              update({
                ...draftConfig,
                topics: [
                  ...draftConfig.topics,
                  {
                    id: "",
                    name: "",
                    categoryId: draftConfig.categories[0]?.id ?? "",
                    systemPrompt: "",
                  },
                ],
              })
            }
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        {draftConfig.topics.map((t: any, i: number) => (
          <Paper
            key={i}
            p="md"
            radius="md"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Stack gap="sm">
              {/* TOP ROW (X ON TOP RIGHT) */}
              <Group justify="space-between" align="flex-start">
                <Text fw={600} size="sm" c="dimmed">
                  Topic #{i + 1}
                </Text>

                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() =>
                    update({
                      ...draftConfig,
                      topics: draftConfig.topics.filter(
                        (_: any, idx: number) => idx !== i
                      ),
                    })
                  }
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              <Divider color="rgba(255,255,255,0.08)" />

              <Group grow>
                <TextInput
                  label="Id"
                  value={t.id}
                  classNames={{ input: "glassy-input" }}
                  onChange={(e) =>
                    update({
                      ...draftConfig,
                      topics: draftConfig.topics.map((x: any, idx: number) =>
                        idx === i ? { ...x, id: e.currentTarget.value } : x
                      ),
                    })
                  }
                />

                <TextInput
                  label="Name"
                  value={t.name}
                  classNames={{ input: "glassy-input" }}
                  onChange={(e) =>
                    update({
                      ...draftConfig,
                      topics: draftConfig.topics.map((x: any, idx: number) =>
                        idx === i ? { ...x, name: e.currentTarget.value } : x
                      ),
                    })
                  }
                />
              </Group>

              <Select
                label="Category"
                value={t.categoryId}
                data={draftConfig.categories.map((c: any) => ({
                  value: c.id,
                  label: c.label || c.id,
                }))}
                classNames={{ input: "glassy-input" }}
                onChange={(v) =>
                  v &&
                  update({
                    ...draftConfig,
                    topics: draftConfig.topics.map((x: any, idx: number) =>
                      idx === i ? { ...x, categoryId: v } : x
                    ),
                  })
                }
              />

              <Textarea
                label="System Prompt"
                minRows={4}
                autosize
                value={t.systemPrompt}
                classNames={{ input: "glassy-input" }}
                styles={{
                  input: {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  },
                }}
                onChange={(e) =>
                  update({
                    ...draftConfig,
                    topics: draftConfig.topics.map((x: any, idx: number) =>
                      idx === i
                        ? { ...x, systemPrompt: e.currentTarget.value }
                        : x
                    ),
                  })
                }
              />
            </Stack>
          </Paper>
        ))}
      </Stack>
      </Stack>
    </Modal>
  );
}