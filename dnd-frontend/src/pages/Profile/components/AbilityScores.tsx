import { Button, Collapse, Grid } from "@mantine/core";
import { AbilityScore } from "./AbilityScore";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { RadarChart } from "@mantine/charts";
import AbilityScoreTooltip from "./AbilityScoreToolTip";
import { useState } from "react";
import { StatBox } from "./StatBox";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";

export function AbilityScores() {
  const character = useCharacterStore((state) => state.character)!;
  const [opened, setOpened] = useState(false);

  return (
    <ExpandableSection
      title="Ability Scores"
      color= {SectionColor.Violet}
      defaultOpen
      transparent={true}
      icon={<span style={{ fontSize: "1.2rem" }}>💪</span>}
      style={{
        background: "linear-gradient(135deg, rgba(36, 0, 33, 0.23), rgba(56, 27, 0, 0.36))",
        boxShadow: "0 0 10px rgba(51, 0, 73, 0.2), inset 0 0 6px rgba(51, 17, 82, 0.56)",
        borderColor: "rgba(185, 30, 216, 0.34)",
        borderRadius: "10px",
        transition: "all 0.25s ease-in-out",
      }}
    >
    <Grid
      gutter="md"
      justify="space-between"
      align="center"
    >
      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="STRENGTH" score={character.abilityScores.str} />
        <StatBox
          label="STR Save"
          value={character.savingThrows.strength >= 0
            ? `+${character.savingThrows.strength}`
            : `${character.savingThrows.strength}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="DEXTERITY" score={character.abilityScores.dex} />
        <StatBox
          label="DEX Save"
          value={character.savingThrows.dexterity >= 0
            ? `+${character.savingThrows.dexterity}`
            : `${character.savingThrows.dexterity}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="CONSTITUTION" score={character.abilityScores.con} />
        <StatBox
          label="CON Save"
          value={character.savingThrows.constitution >= 0
            ? `+${character.savingThrows.constitution}`
            : `${character.savingThrows.constitution}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="INTELLIGENCE" score={character.abilityScores.int} />
        <StatBox
          label="INT Save"
          value={character.savingThrows.intelligence >= 0
            ? `+${character.savingThrows.intelligence}`
            : `${character.savingThrows.intelligence}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="WISDOM" score={character.abilityScores.wis} />
        <StatBox
          label="WIS Save"
          value={character.savingThrows.wisdom >= 0
            ? `+${character.savingThrows.wisdom}`
            : `${character.savingThrows.wisdom}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 4 }}>
        <AbilityScore name="CHARISMA" score={character.abilityScores.cha} />
        <StatBox
          label="CHA Save"
          value={character.savingThrows.charisma >= 0
            ? `+${character.savingThrows.charisma}`
            : `${character.savingThrows.charisma}`}
          size="xs"
          color="yellow"
        />
      </Grid.Col>
    </Grid>

      <Button fullWidth mt="md" variant="light" color={SectionColor.Cyan} onClick={() => setOpened(!opened)}>
        {opened ? "Hide Chart" : "Show Chart"}
      </Button>
      {/* Radar Chart */}

      <Collapse in={opened} transitionDuration={300}>
        {opened && (
          <div style={{ minHeight: '35vh', width: '100%' }}>
            <RadarChart
              h="35vh"
              w="100%"
              data={
                character.abilityScores.str 
                && character.abilityScores.dex 
                && character.abilityScores.con 
                && character.abilityScores.int 
                && character.abilityScores.wis 
                && character.abilityScores.cha
                  ? [
                      { ability: 'STR', score: character.abilityScores.str },
                      { ability: 'DEX', score: character.abilityScores.dex },
                      { ability: 'CON', score: character.abilityScores.con },
                      { ability: 'INT', score: character.abilityScores.int },
                      { ability: 'WIS', score: character.abilityScores.wis },
                      { ability: 'CHA', score: character.abilityScores.cha },
                    ]
                  : [{ ability: 'No Data', score: 0 }]
              }
              dataKey="ability"
              series={[{ name: 'score', color: 'cyan.6', opacity: 0 }]}
              withDots
              textColor="white.0"
              withTooltip
              tooltipProps={{ content: <AbilityScoreTooltip /> }}
              radarProps={{
                stroke: 'cyan',
                fill: 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,128,128,0.4))',
                filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.26))',
                strokeWidth: 2,
              }}
              dotProps={{
                r: 6,
                stroke: 'white',
                strokeWidth: 2,
                fill: 'cyan',
              }}
              gridColor="gray.5"
              withPolarAngleAxis
            />
          </div>
        )}
      </Collapse>

    </ExpandableSection> 
  );
}
