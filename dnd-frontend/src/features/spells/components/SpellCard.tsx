import {
  Card,
  Group,
  Stack,
  Text,
  Divider,
  Table,
} from "@mantine/core";
import { useSpellStore } from "../@store/useSpellStore";
import CustomBadge from "@components/common/CustomBadge";
import DisplayText from "@components/common/DisplayText";
import { ExpandableSection } from "@components/ExpandableSection";
import { IconWand, IconFlame, IconBook, IconSparkles } from "@tabler/icons-react";
import { SectionColor } from "@appTypes/SectionColor";
import { DividerWithLabel } from "@components/common/DividerWithLabel";
import { getDamageInfo } from "../@utils/getDamageInfo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  function processDescription(descArray: string[]) {
    const result = [];
    let currentTable: string[] = [];
    
    for (let i = 0; i < descArray.length; i++) {
      const line = descArray[i];
      
      // Check if this line starts a table or is part of a table
      if (line.startsWith('|') || (line.includes('#####') && descArray[i + 1]?.startsWith('|'))) {
        currentTable.push(line);
      } else {
        // If we were building a table, push it first
        if (currentTable.length > 0) {
          result.push(currentTable.join('\n'));
          currentTable = [];
        }
        result.push(line);
      }
    }
    
    // Don't forget the last table
    if (currentTable.length > 0) {
      result.push(currentTable.join('\n'));
    }
    
    return result;
  }

  return (
    <Card 
    p="md" 
    withBorder 
    mb="md" 
    style={{ 
      background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)", 
      }}>
      {/* Header */}
      <Group justify="" mb="sm">

        <Text size="xl" fw={700} tt="uppercase">
            {currentSpell.name}
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

        {currentSpell.material && (
        <Text component="span" size="sm" c="dimmed" fs="italic">
          ({currentSpell.material})
        </Text>
        )}

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
          {
            processDescription(currentSpell.description).map((content, i) => (
              <ReactMarkdown 
                key={i} 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <Text size="md" {...props} style={{ margin: 0, lineHeight: 1.3 }} />,
                  // Reduce header margins
                  h1: ({node, ...props}) => <Text component="h1" size="xl" fw={800} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  h2: ({node, ...props}) => <Text component="h2" size="lg" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  h3: ({node, ...props}) => <Text component="h3" size="md" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  h4: ({node, ...props}) => <Text component="h4" size="md" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  h5: ({node, ...props}) => <Text component="h5" size="sm" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  h6: ({node, ...props}) => <Text component="h6" size="sm" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2 }} />,
                  table: ({node, ...props}) => (
                    <Table 
                      striped 
                      highlightOnHover 
                      withTableBorder 
                      withColumnBorders
                      style={{ margin: '8px 0' }} // Reduced margin
                      {...props}
                    />
                  ),
                  th: ({node, ...props}) => (
                    <Table.Th 
                      style={{ 
                        textAlign: 'left',
                        padding: '5px', // Slightly reduced padding
                        fontWeight: 600 
                      }} 
                      {...props} 
                    />
                  ),
                  td: ({node, ...props}) => (
                    <Table.Td 
                      style={{ 
                        textAlign: 'left',
                        padding: '5px' // Slightly reduced padding
                      }} 
                      {...props} 
                    />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            ))
          }

          {currentSpell.higherLevel?.length > 0 && (
            <>
              <Divider my="xs" color="rgba(255,255,255,0.1)" />
              <Text fw={600} style={{ marginBottom: 4 }}>At Higher Levels:</Text> {/* Reduced bottom margin */}

              {currentSpell.higherLevel.map((hl, i) => (
                <Text key={i} size="sm" style={{ margin: 0, lineHeight: 1.4 }}>
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
