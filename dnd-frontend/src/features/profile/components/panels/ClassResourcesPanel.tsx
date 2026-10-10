import { SimpleGrid, Text } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { StatBox } from "@features/profile/components/StatBox";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import { updateCharacter } from "@services/characterService";

const RECHARGE_LABEL = { short: "Short Rest", long: "Long Rest", none: "Manual" };

export function ClassResourcesPanel() {
  const character = useCurrentCharacter()!;
  const { updateCharacter: updateStore } = useCharacterCoreActions();
  const resources = character.classResources ?? [];

  const spendResource = (index: number) => {
    const found = resources[index];
    if (!found || found.current <= 0) {
      showNotification({
        id: "resource-used",
        title: "",
        message: `${found?.name ?? "Resource"} depleted.`,
        color: SectionColor.Yellow,
        icon: <IconExclamationCircle />
      });
      return;
    }

    const updated = resources.map((r, i) => (i === index ? { ...r, current: r.current - 1 } : r));
    updateStore({ classResources: updated });
    updateCharacter({ ...character, classResources: updated });
  };

  return (
    <ExpandableSection
      title="Class Resources"
      defaultOpen
      color={SectionColor.Teal}
      transparent
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
      }}
    >
      {resources.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No class resources. Add Ki Points, Sorcery Points, etc. under Edit Character → Resources.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3 }} mt="md">
          {resources.map((r, i) => (
            <StatBox
              variant="galaxy"
              key={i}
              label={`${r.name} · ${RECHARGE_LABEL[r.recharge] ?? r.recharge}`}
              value={`${r.current} / ${r.max}`}
              size="sm"
              color="teal.5"
              background="transparent"
              onClick={() => spendResource(i)}
            />
          ))}
        </SimpleGrid>
      )}
    </ExpandableSection>
  );
}
