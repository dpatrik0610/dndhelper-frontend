import {
  Card,
  Group,
  Stack,
  Text,
  Divider,
  Table,
  SimpleGrid,
  Box,
} from "@mantine/core";
import { useSpellStore } from "@store/spell/spellStore";
import CustomBadge from "@components/common/CustomBadge";
import { IconWand, IconFlame, IconBook, IconSparkles } from "@tabler/icons-react";
import { SectionColor } from "@appTypes/SectionColor";
import { DividerWithLabel } from "@components/common/DividerWithLabel";
import { getDamageInfo } from "@utils/getDamageInfo";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SpellCardProps {
  flat?: boolean;
}

export function SpellCard({ flat = false }: SpellCardProps) {  
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

  // Unified Details & Effects List (Flat layout to prevent cluttered nested boxes)
  const detailsList = [
    { label: "Casting Time", value: currentSpell.castingTime ?? "Instantaneous", color: "var(--theme-color-text-primary, #fff)" },
    { label: "Range", value: currentSpell.range, color: "var(--theme-color-text-primary, #fff)" },
    { label: "Duration", value: currentSpell.duration, color: "var(--theme-color-text-primary, #fff)" },
  ];

  // Dynamically inject special effects into the flat grid if they exist
  const damageInfo = getDamageInfo(currentSpell.damage);
  if (damageInfo) {
    detailsList.push({ label: "Damage", value: damageInfo.label, color: "#f87171" });
  }
  if (currentSpell.dc?.dcType?.name && currentSpell.dc.dcSuccess) {
    detailsList.push({ label: "Saving Throw", value: `${currentSpell.dc.dcType.name} (Success: ${currentSpell.dc.dcSuccess})`, color: "#fcd34d" });
  }
  if (currentSpell.areaOfEffect?.type && currentSpell.areaOfEffect?.size) {
    detailsList.push({ label: "Area of Effect", value: `${currentSpell.areaOfEffect.size}ft ${currentSpell.areaOfEffect.type}`, color: "#67e8f9" });
  }

  const cardContent = (
    <>
      {/* Header */}
      <Group justify="space-between" mb="xs" wrap="wrap">
        <Text
          size="lg"
          fw={900}
          tt="uppercase"
          style={{
            color: "var(--theme-color-text-primary, #fff)",
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {currentSpell.name}
        </Text>

        {/* Magic School */}
        <CustomBadge
          variant="transparent"
          size="lg"
          label={currentSpell.school.name}
          color={getSchoolColor(currentSpell.school.name)}
          icon={<IconBook size={15} />}
        />
      </Group>

      {currentSpell.material && (
        <Text
          component="span"
          size="xs"
          fs="italic"
          style={{
            color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.55))",
            display: "block",
            marginBottom: "12px",
            lineHeight: 1.4,
          }}
        >
          ({currentSpell.material})
        </Text>
      )}

      <DividerWithLabel label="Spell Details" color={SectionColor.Violet} />

      {/* Meta Badges */}
      <Group mb="md" gap="xs" style={{ marginTop: "12px" }}>
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
            variant="dot" 
          />
        ))}
      </Group>

      {/* Unified Core Details & Effects Flat Grid */}
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm" style={{ marginTop: "16px", marginBottom: "16px", paddingLeft: "4px" }}>
        {detailsList.map((detail) => (
          <div key={detail.label} style={{ padding: "4px 0" }}>
            <Text
              size="9px"
              fw={800}
              style={{
                color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.5))",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              {detail.label}
            </Text>
            <Text
              size="sm"
              fw={700}
              style={{
                color: detail.color,
                lineHeight: 1.3,
              }}
            >
              {detail.value}
            </Text>
          </div>
        ))}
      </SimpleGrid>

      {/* Flat Description Panel */}
      <Text
        fw={800}
        size="xs"
        style={{
          color: "var(--theme-color-accent-primary, #f59e0b)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "8px",
          marginTop: "16px",
        }}
      >
        Description
      </Text>
      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.05)", marginBottom: "12px" }} />
      
      <Stack gap="sm" style={{ paddingLeft: "4px" }}>  
        {
          processDescription(currentSpell.description).map((content, i) => (
            <ReactMarkdown 
              key={i} 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => (void node, (
                  <Text 
                    size="sm" 
                    {...props} 
                    style={{ 
                      margin: 0, 
                      lineHeight: 1.6,
                      color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.8))",
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    }} 
                  />
                )),
                h1: ({node, ...props}) => (void node, <Text component="h1" size="xl" fw={800} tt={"uppercase"} {...props} style={{ margin: '8px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                h2: ({node, ...props}) => (void node, <Text component="h2" size="lg" fw={700} tt={"uppercase"} {...props} style={{ margin: '8px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                h3: ({node, ...props}) => (void node, <Text component="h3" size="md" fw={700} tt={"uppercase"} {...props} style={{ margin: '6px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                h4: ({node, ...props}) => (void node, <Text component="h4" size="md" fw={700} tt={"uppercase"} {...props} style={{ margin: '6px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                h5: ({node, ...props}) => (void node, <Text component="h5" size="sm" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                h6: ({node, ...props}) => (void node, <Text component="h6" size="sm" fw={700} tt={"uppercase"} {...props} style={{ margin: '4px 0', lineHeight: 1.2, color: 'var(--theme-color-text-primary, #fff)' }} />),
                table: ({node, ...props}) => (void node, (
                  <Table 
                    striped 
                    highlightOnHover 
                    withTableBorder 
                    withColumnBorders
                    style={{ 
                      margin: '12px 0',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))',
                      borderRadius: '8px',
                    }} 
                    {...props}
                  />
                )),
                th: ({node, ...props}) => (void node, (
                  <Table.Th 
                    style={{ 
                      textAlign: 'left',
                      padding: '6px 10px',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      color: 'var(--theme-color-text-primary, #fff)',
                      borderBottom: '1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1))',
                    }} 
                    {...props} 
                  />
                )),
                td: ({node, ...props}) => (void node, (
                  <Table.Td 
                    style={{ 
                      textAlign: 'left',
                      padding: '6px 10px',
                      fontSize: '12px',
                      color: 'var(--theme-color-text-secondary, rgba(255, 255, 255, 0.75))',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
                    }} 
                    {...props} 
                  />
                )),
              }}
            >
              {content}
            </ReactMarkdown>
          ))
        }

        {currentSpell.higherLevel?.length > 0 && (
          <>
            <Divider my="sm" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <Text fw={700} size="xs" style={{ marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--theme-color-accent-primary, #f59e0b)" }}>
              At Higher Levels:
            </Text>

            {currentSpell.higherLevel.map((hl, i) => (
              <Text 
                key={i} 
                size="sm" 
                lh={1.5}
                style={{ 
                  margin: 0,
                  color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.75))",
                  fontStyle: "italic"
                }}
              >
                {hl}
              </Text>
            ))}
          </>
        )}
      </Stack>

      {/* Flat Classes Panel */}
      <Text
        fw={800}
        size="xs"
        style={{
          color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.45))",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "8px",
          marginTop: "24px",
        }}
      >
        Available To
      </Text>
      <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.05)", marginBottom: "12px" }} />
      <Group gap="xs" wrap="wrap" style={{ paddingLeft: "4px" }}>
        {currentSpell.classes.map((cls, i) => (
          <CustomBadge key={i} label={cls.name} color="blue" variant="light" />
        ))}
      </Group>
    </>
  );

  if (flat) {
    return (
      <Box style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}>
        {cardContent}
      </Box>
    );
  }

  return (
    <Card 
      p="md" 
      withBorder 
      mb="md" 
      style={{ 
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
        borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.03)",
        borderRadius: "14px",
      }}
    >
      {cardContent}
    </Card>
  );
}
