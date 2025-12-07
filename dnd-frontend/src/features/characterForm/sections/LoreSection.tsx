import { Stack, Textarea, Group, TextInput } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/useCharacterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";

export function LoreSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const glass = { input: "glassy-input", label: "glassy-label" };

  return (
    <ExpandableSection title="Lore & Personality" icon={<IconBook />} color={SectionColor.Orange} defaultOpen>
      <Stack>

        <Group grow>
          <FormNumberInput label="Age" min={0} value={characterForm.age} classNames={glass} onChange={(v) => setCharacterForm({ age: v })} />
          <TextInput label="Height" value={characterForm.height} classNames={glass} onChange={(e) => setCharacterForm({ height: e.currentTarget.value })} />
          <TextInput label="Weight" value={characterForm.weight} classNames={glass} onChange={(e) => setCharacterForm({ weight: e.currentTarget.value })} />
        </Group>

        <Group grow>
          <TextInput label="Eyes" value={characterForm.eyes} classNames={glass} onChange={(e) => setCharacterForm({ eyes: e.currentTarget.value })} />
          <TextInput label="Skin" value={characterForm.skin} classNames={glass} onChange={(e) => setCharacterForm({ skin: e.currentTarget.value })} />
          <TextInput label="Hair" value={characterForm.hair} classNames={glass} onChange={(e) => setCharacterForm({ hair: e.currentTarget.value })} />
        </Group>

        <Textarea autosize label="Appearance" classNames={glass} value={characterForm.appearance} onChange={(e) => setCharacterForm({ appearance: e.currentTarget.value })} />
        <Textarea autosize label="Personality Traits" classNames={glass} value={characterForm.personalityTraits} onChange={(e) => setCharacterForm({ personalityTraits: e.currentTarget.value })} />
        <Textarea autosize label="Ideals" classNames={glass} value={characterForm.ideals} onChange={(e) => setCharacterForm({ ideals: e.currentTarget.value })} />
        <Textarea autosize label="Bonds" classNames={glass} value={characterForm.bonds} onChange={(e) => setCharacterForm({ bonds: e.currentTarget.value })} />
        <Textarea autosize label="Flaws" classNames={glass} value={characterForm.flaws} onChange={(e) => setCharacterForm({ flaws: e.currentTarget.value })} />

        <Textarea autosize label="Backstory" classNames={glass} value={characterForm.backstory.join("\n")} onChange={(e) => setCharacterForm({ backstory: e.currentTarget.value.split("\n") })} />

      </Stack>
    </ExpandableSection>
  );
}
