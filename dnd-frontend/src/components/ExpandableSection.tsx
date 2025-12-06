import { useState, type ReactNode, type CSSProperties } from "react";
import { Paper, Group, Text, ActionIcon, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { SectionColor } from "../types/SectionColor";
import { BaseTransition } from "./animations/BaseTransition";

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
  titleContent?: ReactNode;
  icon?: ReactNode;
  color?: SectionColor;
  defaultOpen?: boolean;
  transparent?: boolean;
  style?: CSSProperties;
  padding?: number | string;
  marginTop?: number | string;
  marginBottom?: number | string;
  animated?: boolean;
  expandable?: boolean;
}

export function ExpandableSection({
  title,
  children,
  titleContent,
  icon,
  color = SectionColor.Blue,
  defaultOpen = false,
  transparent = true,
  style = {},
  padding = "md",
  marginTop = "sm",
  marginBottom = "sm",
  animated = false,
  expandable = true,
}: ExpandableSectionProps) {
  const [opened, setOpened] = useState(defaultOpen);

  return (
    <Paper
      p={padding}
      withBorder
      mb={marginBottom}
      mt={marginTop}
      style={{
        backgroundColor: transparent
          ? "rgba(0, 0, 0, 0.14)"
          : "var(--mantine-color-body)",
        transition: "background-color 0.2s ease",
        ...style,
      }}
    >
      <Group
        justify="space-between"
        onClick={() => expandable && setOpened(!opened)}
        style={{ cursor: expandable ? "pointer" : "default" }}
      >
        <Group gap="xs">
          {icon}
          {titleContent ?? (
            <Text fw={600} c={color} size="sm" tt="uppercase">
              {title}
            </Text>
          )}
        </Group>
        {expandable && (
          <ActionIcon color={color} variant="light" size="sm" radius="xl">
            {opened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </ActionIcon>
        )}
      </Group>

      {expandable ? (
        <Collapse in={opened} transitionDuration={200}>
          {animated ? (
            <BaseTransition show={opened} variant="fade" layout={false}>
              <div style={{ marginTop: "0.75rem" }}>{children}</div>
            </BaseTransition>
          ) : (
            <div style={{ marginTop: "0.75rem" }}>{children}</div>
          )}
        </Collapse>
      ) : (
        <div style={{ marginTop: "0.75rem" }}>{children}</div>
      )}
    </Paper>
  );
}
