import { useState, type ReactNode, type CSSProperties } from "react";
import { Paper, Group, Text, ActionIcon, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { SectionColor } from "../types/SectionColor";

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  color?: SectionColor;
  defaultOpen?: boolean;
  transparent?: boolean;
  style?: CSSProperties;
}

export function ExpandableSection({
  title,
  children,
  icon,
  color = SectionColor.Blue,
  defaultOpen = false,
  transparent = true,
  style = {},
}: ExpandableSectionProps) {
  const [opened, setOpened] = useState(defaultOpen);

  return (
    <Paper
      p="md"
      withBorder
      mb="sm"
      mt="sm"
      style={{
        backgroundColor: transparent
          ? "rgba(0, 0, 0, 0.42)"
          : "var(--mantine-color-body)",
        transition: "background-color 0.2s ease",
        ...style,
      }}
    >
      <Group
        justify="space-between"
        onClick={() => setOpened(!opened)}
        style={{ cursor: "pointer" }}
      >
        <Group gap="xs">
          {icon}
          <Text fw={600} c={color} size="sm" tt="uppercase">
            {title}
          </Text>
        </Group>
        <ActionIcon color={color} variant="light" size="sm" radius="xl">
          {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </ActionIcon>
      </Group>

      <Collapse in={opened} transitionDuration={200}>
        <div style={{ marginTop: "0.75rem" }}>{children}</div>
      </Collapse>
    </Paper>
  );
}
