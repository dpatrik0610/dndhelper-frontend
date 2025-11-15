import { Button, Group, Paper, Title } from "@mantine/core";
import { longrest } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";
import { IconCoin, IconDroplet, IconEdit, IconMoon, IconPlus, IconSwords } from "@tabler/icons-react";
import { loadCharacters } from "../../../utils/loadCharacter";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNavigate } from "react-router-dom";
import { SectionColor } from "../../../types/SectionColor";
import { useState, type MouseEventHandler } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { AddConditionModal } from "./AddConditionModal";
import { DamageModal } from "./DamageModal";
import { RemoveCurrencyModal } from "./RemoveCurrencyModal";
import { TransferCurrencyModal } from "./TransferCurrencyModal";
import { ExpandableSection } from "../../../components/ExpendableSection";

export interface ActionButtonProps {
  label: string;
  icon: any;
  onClick: MouseEventHandler;
}

export function ActionBar() {
  const [modalOpened, setModalOpened] = useState(false);
  const [damageModalOpened, setDamageModalOpened] = useState(false);
  const [removeCurrencyModalOpened, setRemoveCurrencyModalOpened] = useState(false);
  const [transferCurrencyModalOpened, setTransferCurrencyModalOpened] = useState(false);

  const token = useAuthStore.getState().token;
  const navigate = useNavigate();
  const character = useCharacterStore((state) => state.character);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!token || !character?.id) return null;

  async function handleLongrest() {
    await longrest(character!.id!, token!);
    await loadCharacters(token!);
    showNotification({
      id: "longrest-success",
      title: "Success",
      message: "You slept through the night 🙂",
      icon: <IconMoon />,
    });
  }

  const actions: ActionButtonProps[] = [
    { label: "Long Rest", icon: <IconMoon />, onClick: handleLongrest },
    { label: "Edit Character", icon: <IconEdit />, onClick: () => navigate("/editCharacter") },
    { label: "Add Condition", icon: <IconPlus />, onClick: () => setModalOpened(true) },
    { label: "Damage", icon: <IconDroplet size={16} />, onClick: () => setDamageModalOpened(true) },
    { label: "Delete Money", icon: <IconCoin size={16} />, onClick: () => setRemoveCurrencyModalOpened(true) },
    { label: "Send Money", icon: <IconCoin size={16} />, onClick: () => setTransferCurrencyModalOpened(true) },
  ];

  // --------------------------------------------
  //      MOBILE VERSION → SAME BUTTONS, NO SHRINKING
  // --------------------------------------------
if (isMobile) {
  return (
    <>
      <ExpandableSection
        title="Actions"
        icon={<IconSwords />}
        color={SectionColor.Violet}
        defaultOpen={false}
      >
        <Group gap="xs" wrap="wrap" justify="center">
          {actions.map((action) => (
            <Button
              key={action.label}
              leftSection={action.icon}
              variant="outline"
              gradient={{ from: SectionColor.Violet, to: SectionColor.Cyan, deg: 180 }}
              onClick={action.onClick}
              size="xs"
              radius="md"
              style={{
                flex: "1 1 calc(50% - 8px)", // two equal buttons per row
                minWidth: 140,               // prevents ugly shrinking
                maxWidth: "48%",             // stays symmetrical
              }}
            >
              {action.label}
            </Button>
          ))}
        </Group>
      </ExpandableSection>

      <AddConditionModal opened={modalOpened} onClose={() => setModalOpened(false)} />
      <DamageModal opened={damageModalOpened} onClose={() => setDamageModalOpened(false)} />
      <RemoveCurrencyModal opened={removeCurrencyModalOpened} onClose={() => setRemoveCurrencyModalOpened(false)} />
      <TransferCurrencyModal opened={transferCurrencyModalOpened} onClose={() => setTransferCurrencyModalOpened(false)} />
    </>
    );
  }

  // --------------------------------------------
  //      DESKTOP VERSION → Original Paper
  // --------------------------------------------
  return (
    <>
      <Paper
        p="md"
        withBorder
        mb="md"
        style={{
          background: "linear-gradient(175deg, #0009336b 0%, rgba(48,0,0,0.37) 100%)",
        }}
      >
        <Title order={3} mb="md">
          Action Bar
        </Title>

        <Group>
          {actions.map((action) => (
            <Button
              key={action.label}
              leftSection={action.icon}
              variant="outline"
              gradient={{ from: SectionColor.Violet, to: SectionColor.Cyan, deg: 180 }}
              onClick={action.onClick}
              size="xs"
              radius="md"
            >
              {action.label}
            </Button>
          ))}
        </Group>
      </Paper>

      <AddConditionModal opened={modalOpened} onClose={() => setModalOpened(false)} />
      <DamageModal opened={damageModalOpened} onClose={() => setDamageModalOpened(false)} />
      <RemoveCurrencyModal opened={removeCurrencyModalOpened} onClose={() => setRemoveCurrencyModalOpened(false)} />
      <TransferCurrencyModal opened={transferCurrencyModalOpened} onClose={() => setTransferCurrencyModalOpened(false)} />
    </>
  );
}
