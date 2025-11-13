import {
  Modal,
  Box,
  Group,
  Text,
  Stack,
  Loader,
  Button,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface Props {
  opened: boolean;
  onClose: () => void;
  title: string;
  loading: boolean;
  desc: string[];
  error: string | null;
  onRemove: () => void;
  saving: boolean;
}

const REMOVE_BUTTON_BASE = "0 0 6px rgba(255,100,100,0.5)";
const REMOVE_BUTTON_HOVER = "0 0 14px rgba(255,150,80,0.8)";

export function ConditionDetailsModal({
  opened,
  onClose,
  title,
  loading,
  desc,
  error,
  onRemove,
  saving,
}: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={title}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      transitionProps={{ transition: "fade", duration: 200 }}
      styles={{
        header: {
          fontWeight: "bold",
          background: "transparent",
          letterSpacing: "1px",
        },
        content: {
          background:
            "linear-gradient(145deg, rgba(40,0,0,0.9), rgba(20,0,0,0.65))",
          border: "1px solid rgba(255,0,0,0.25)",
          boxShadow:
            "0 0 15px rgba(255,60,60,0.2), inset 0 0 10px rgba(255,0,0,0.1)",
        },
        title: { color: "white" },
      }}
    >
      <Box p="sm">
        {loading ? (
          <Group justify="center" py="md">
            <Loader color="red" />
          </Group>
        ) : (
          <>
            {error && (
              <Text size="sm" c="red.4" mb="xs">
                {error}
              </Text>
            )}

            {desc.length > 0 && (
              <Stack gap="xs">
                {desc.map((line, idx) => (
                  <Text key={idx} size="sm" c="gray.1">
                    {line}
                  </Text>
                ))}
              </Stack>
            )}
          </>
        )}

        {onRemove && (
          <Group justify="flex-end" mt="md">
            <Button
              variant="gradient"
              gradient={{ from: "red", to: "orange", deg: 45 }}
              size="xs"
              onClick={onRemove}
              leftSection={<IconTrash size={14} />}
              disabled={saving}
              style={{
                boxShadow: REMOVE_BUTTON_BASE,
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = REMOVE_BUTTON_HOVER)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = REMOVE_BUTTON_BASE)
              }
            >
              {saving ? "Removing..." : "Remove Condition"}
            </Button>
          </Group>
        )}
      </Box>
    </Modal>
  );
}
