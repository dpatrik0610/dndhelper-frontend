import { useState, type ReactNode, type CSSProperties } from "react";
import { Paper, Group, Text, ActionIcon, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { SectionColor } from "@appTypes/SectionColor";
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
  rightSection?: ReactNode;
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
  rightSection,
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
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
          isolation: "isolate",
        ...style,
      }}
    >
      <Group
        justify="space-between"
        onClick={() => expandable && setOpened(!opened)}
        style={{ cursor: expandable ? "pointer" : "default", width: "100%", wrap: "nowrap" }}
      >
        <Group gap="xs" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {icon}
          {titleContent ?? (
            <Text
              fw={300}
              size="sm"
              tt="uppercase"
              truncate="end"
              style={{
                width: "100%",
                letterSpacing: "4px",
                color: "var(--theme-color-text-primary, #fff)",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              }}
            >
              {title}
            </Text>
          )}
        </Group>
        {!expandable && rightSection}
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
