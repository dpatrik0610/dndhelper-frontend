import { Button, Card, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconUser, IconUserPlus } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import type { ReactNode } from "react";

interface BaseProps {
  palette: { cardBg: string; border: string; textMain: string; textDim: string; accent: string };
}

interface SelectedProps extends BaseProps {
  variant: "selected";
  character: Character;
  onSelect: () => void;
  onProfile: () => void;
}

interface SelectPromptProps extends BaseProps {
  variant: "select";
  count: number;
  onSelect: () => void;
}

interface EmptyProps extends BaseProps {
  variant: "empty";
  onCreate: () => void;
}

type Props = SelectedProps | SelectPromptProps | EmptyProps;

export function CharacterSection(props: Props) {
  const { palette } = props;
  const commonStyle = { background: palette.cardBg, borderColor: palette.border, color: palette.textMain };

  const CardShell = ({ children }: { children: ReactNode }) => (
    <Card shadow="lg" radius="md" withBorder p="lg" style={commonStyle}>
      <Group justify="space-between" align="center">
        {children}
      </Group>
    </Card>
  );

  const titleBlock = (title: string, subtitle: string) => (
    <div>
      <Text fw={700} c={palette.textMain}>
        {title}
      </Text>
      <Text size="sm" c={palette.textDim}>
        {subtitle}
      </Text>
    </div>
  );

  const gradientButtonStyle = { root: { boxShadow: "0 0 8px rgba(177, 151, 252, 0.8)" } };
  const outlineButtonStyle = { borderColor: palette.accent, boxShadow: "0 0 5px rgba(177, 151, 252, 0.9)" };
  const selectButton = (onClick: () => void) => (
    <Button variant="outline" onClick={onClick} style={outlineButtonStyle}>
      Select Character
    </Button>
  );

  const viewProfileButton = (onclick: () => void) => (
    <Button leftSection={<IconUser size={16} />} onClick={onclick} style={outlineButtonStyle}>
      View Profile
    </Button>
  )

  switch (props.variant) {
    case "selected": {
      const { character, onSelect, onProfile } = props;
      return (
        <CardShell>
          <Group align="flex-start">
            <ThemeIcon size={56} radius="xl" variant="gradient" gradient={{ from: "grape", to: "indigo" }}>
              <Text fw={800}>{character.name.charAt(0)}</Text>
            </ThemeIcon>
            <Stack gap={2}>
              <Text fw={700} c={palette.textMain}>
                {character.name}
              </Text>
              <Text size="sm" c={palette.textDim}>
                Level {character.level} {character.race} {character.characterClass}
              </Text>
            </Stack>
          </Group>

          <Group gap="md">
            {selectButton(onSelect)}
            {viewProfileButton(onProfile)}
          </Group>
        </CardShell>
      );
    }

    case "select":
      return (
        <CardShell>
          {titleBlock(
            "No character selected",
            `You have ${props.count} characters available. Choose one to set as active.`
          )}

          {selectButton(props.onSelect)}
        </CardShell>
      );

    case "empty":
    default:
      return (
        <CardShell>
          {titleBlock("No characters yet", "Create your first character to begin your adventure.")}

          <Button leftSection={<IconUserPlus size={16} />} variant="gradient" gradient={{ from: "violet", to: "grape" }} bg="transparent" styles={gradientButtonStyle} onClick={props.onCreate}>
            Create Character
          </Button>
        </CardShell>
      );
  }
}
