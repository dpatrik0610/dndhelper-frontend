import { Button, Group, Paper, Title } from "@mantine/core";
import { longrest } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";
import { IconEdit, IconMoon, IconPlus } from "@tabler/icons-react";
import { loadCharacters } from "../../../utils/loadCharacter";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNavigate } from "react-router-dom";
import { SectionColor } from "../../../types/SectionColor";
import { useState, type MouseEventHandler } from "react";
import { randomId, useMediaQuery } from "@mantine/hooks";
import { AddConditionModal } from "./AddConditionModal";

export interface ActionButtonProps{
    label: string
    icon: any
    onClick: MouseEventHandler
}


export function ActionBar() {
  const [modalOpened, setModalOpened] = useState(false);
  const token = useAuthStore.getState().token;
  if (!token) return;

  const navigate = useNavigate();
  const character = useCharacterStore((state) => state.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  async function handleLongrest() {
    await longrest(character.id!, token!);
    await loadCharacters(token!);
    showNotification({
      id: "longrest-successs",
      title: "Success",
      message: "You slept through the night :)",
      icon: <IconMoon />,
    });
  }

  const actions: ActionButtonProps[] = [
    { label: "Long Rest", icon: <IconMoon />, onClick: () => handleLongrest() },
    { label: "Edit Character", icon: <IconEdit />, onClick: () => navigate("/editCharacter") },
    { label: "Add Condition", icon: <IconPlus />, onClick: () => setModalOpened(true) },
  ];

  return (
    <>
      <Paper
        p="md"
        withBorder
        mb="md"
        style={{
          background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)",
        }}
      >
        <Title order={3} mb="md">
          Action Bar
        </Title>
        <Group>
          {actions.map((action) => (
            <Button
              key={randomId(action.label)}
              leftSection={action.icon}
              variant="gradient"
              gradient={{ from: SectionColor.Violet, to: SectionColor.Cyan, deg: 180 }}
              onClick={action.onClick}
              size="sm"
              radius="md"
              w={isMobile ? "100%" : undefined}
            >
              {action.label}
            </Button>
          ))}
        </Group>
      </Paper>

      {/* ⬇️ New modal */}
      <AddConditionModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
}