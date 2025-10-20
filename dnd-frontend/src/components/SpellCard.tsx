import {
  Card,
  Group,
  Stack,
  Text,
  Divider,
  useMantineTheme,
} from "@mantine/core";
import { useSpellStore } from "../store/useSpellStore";
import CustomBadge from "./common/CustomBadge";
import DisplayText from "./common/DisplayText";
import { ExpandableSection } from "./ExpendableSection";
import { IconWand, IconFlame, IconBook, IconSparkles } from "@tabler/icons-react";
import { SectionColor } from "../types/SectionColor";
import { DividerWithLabel } from "./common/DividerWithLabel";
import { getDamageInfo } from "../utils/getDamageInfo";

export function SpellCard() {
  const currentSpell = useSpellStore((state) => state.currentSpell);

  if (!currentSpell)
    return (
      <Text ta="center" c="dimmed" mt="lg">
        No Spell Selected yet.
      </Text>
    );

  const getSchoolColor = (school: string) => {
    const colors: Record<string, string> = {
      Evocation: "red",
      Abjuration: "blue",
      Conjuration: "green",
      Divination: "indigo",
      Enchantment: "pink",
      Illusion: "grape",
      Necromancy: "dark",
      Transmutation: "orange",
    };
    return colors[school] || "gray";
  };

  function switchComponentText(comp: string): string{
    switch(comp){
        case "V": return "Verbal";
        case "S": return "Somatic";
        case "M": return "Material";
        default: return "";
    }
  }

  return (
    <Card p="md" withBorder mb="md" style={{ background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)" }}>
      {/* Header */}
      <Group justify="space-between" mb="sm">
        <Text size="xl" fw={700} tt="uppercase">
            {currentSpell.name}
            {currentSpell.material && (
            <Text size="sm" c="dimmed" fs="italic">
            ({currentSpell.material})
            </Text>
        )}
        </Text>

        {/* Magic School */}
        <CustomBadge
        variant="transparent"
        size="lg"
          label={currentSpell.school.name}
          color={getSchoolColor(currentSpell.school.name)}
          icon={<IconBook size={16} />}
        />
      </Group>

      <DividerWithLabel label="Spell Details" color={SectionColor.Violet} />

      {/* Meta */}
      <Group mb="md" gap="xs">
        <CustomBadge
            size="lg"
            variant="light"
            label={currentSpell.level === 0 ? "Cantrip" : `Level ${currentSpell.level}`}
            color={currentSpell.level === 0 ? "violet" : "blue"}
            icon={<IconWand size={14} />}
        />
        {currentSpell.ritual && (
          <CustomBadge label="Ritual" color="teal" icon={<IconSparkles size={14} />} />
        )}
        {currentSpell.concentration && (
          <CustomBadge label="Concentration" color="orange" icon={<IconFlame size={14} />} />
        )}

        {/* Components */}
        {currentSpell.components.map((comp, index) => (
            <CustomBadge 
            key={index} 
            size="lg" 
            label={switchComponentText(comp)} 
            color={SectionColor.Orange} 
            variant="dot" />
        ))}
      </Group>

      {/* Core Info */}
      <Stack gap="xs" mb="md">
        <DisplayText displayLabel="Casting Time" displayData={currentSpell.castingTime ?? "Instantaneous"} />
        <DisplayText displayLabel="Range" displayData={currentSpell.range} />
        <DisplayText displayLabel="Duration" displayData={currentSpell.duration} />
      </Stack>

      {/* Description */}
      <ExpandableSection title="Description" color={SectionColor.Blue} defaultOpen>
        <Stack gap="xs">
          {currentSpell.description?.map((paragraph, i) => (
            <Text key={i} size="sm">
              {paragraph}
            </Text>
          ))}
          {currentSpell.higherLevel?.length > 0 && (
            <>
              <Divider my="xs" color="rgba(255,255,255,0.1)" />
              <Text fw={600}>At Higher Levels:</Text>
              {currentSpell.higherLevel.map((hl, i) => (
                <Text key={i} size="sm">
                  {hl}
                </Text>
              ))}
            </>
          )}
        </Stack>
      </ExpandableSection>

      {/* Damage / DC / Area */}
      {(currentSpell.damage || currentSpell.dc || currentSpell.areaOfEffect) && (
        <ExpandableSection 
          title="Effects" 
          color={SectionColor.Red} 
          icon={<IconFlame size={16} />}
        >
          <Stack gap="xs">
            {/* Damage Badge */}
            {(() => {
              const damageInfo = getDamageInfo(currentSpell.damage);
              return damageInfo && (
                <CustomBadge
                  title="Damage"
                  label={damageInfo.label}
                  color="red"
                />
              );
            })()}
            
            {/* Saving Throw Badge */}
            {currentSpell.dc?.dcType?.name && currentSpell.dc.dcSuccess && (
              <CustomBadge
                title="Saving Throw"
                label={`${currentSpell.dc.dcType.name} ${currentSpell.dc.dcSuccess}`}
                color="yellow"
              />
            )}
            
            {/* Area of Effect Badge */}
            {currentSpell.areaOfEffect?.type && currentSpell.areaOfEffect?.size && (
              <CustomBadge
                title="Area"
                label={`${currentSpell.areaOfEffect.size}ft ${currentSpell.areaOfEffect.type}`}
                color="cyan"
              />
            )}
          </Stack>
        </ExpandableSection>
      )}

      {/* Classes */}
      <ExpandableSection title="Available To" color={SectionColor.Violet}>
        <Group gap="xs" wrap="wrap">
          {currentSpell.classes.map((cls, i) => (
            <CustomBadge key={i} label={cls.name} color="blue" variant="light" />
          ))}
        </Group>
      </ExpandableSection>
    </Card>
  );
}
