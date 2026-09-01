import type React from "react";
import {
  Box,
  Group,
  Text,
  Stack,
  Loader,
  Button,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";

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
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      showSaveButton={false}
      showCancelButton={false}
    >
      <Box style={{ position: "relative" }}>
        {loading ? (
          <Group justify="center" py="xl">
            <Loader color="var(--theme-color-accent-primary, #f59e0b)" size="md" />
          </Group>
        ) : (
          <>
            {error && (
              <Text size="sm" c="red.4" mb="sm" fw={500} ta="center">
                {error}
              </Text>
            )}

            {desc.length > 0 && (
              <Box
                p="md"
                style={{
                  background: "rgba(255, 255, 255, 0.015)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05))",
                  borderRadius: "10px",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.01)",
                }}
              >
                <Stack gap="sm">
                  {desc.map((line, idx) => (
                    <Text
                      key={idx}
                      size="sm"
                      lh={1.6}
                      style={{
                        color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.8))",
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                      }}
                    >
                      {line}
                    </Text>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}

        {onRemove && !loading && (
          <Group justify="flex-end" mt="lg">
            <Button
              variant="subtle"
              color="red"
              onClick={onRemove}
              loading={saving}
              disabled={saving}
              leftSection={<IconTrash size={14} />}
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#f87171",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "11px",
                borderRadius: "8px",
                transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.25), 0 4px 15px rgba(0, 0, 0, 0.15)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.05)";
                e.currentTarget.style.transform = "none";
              }}
            >
              {saving ? "Removing..." : "Remove Condition"}
            </Button>
          </Group>
        )}
      </Box>
    </BaseModal>
  );
}
