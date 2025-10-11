import { Button, Collapse, Grid } from "@mantine/core";
import { AbilityScore } from "./AbilityScore";
import { ExpandableSection } from "./ExpendableSection";
import { RadarChart } from "@mantine/charts";
import AbilityScoreTooltip from "./AbilityScoreToolTip";
import { useState } from "react";
import { StatBox } from "./StatBox";

export interface AbilityScoresProps {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  strSave?: number;
  dexSave?: number;
  conSave?: number;
  intSave?: number;
  wisSave?: number;
  chaSave?: number;
}

export function AbilityScores({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  strSave = 0,
  dexSave = 0,
  conSave = 0,
  intSave = 0,
  wisSave = 0,
  chaSave = 0,
}: AbilityScoresProps) {
  const [opened, setOpened] = useState(false);

  return (
    <ExpandableSection
      title="Ability Scores"
      color="violet"
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
          <AbilityScore name="STRENGTH" score={strength} />
          <StatBox label={`STR Save`} value={wisSave >= 0 ? `+${strSave}` : wisSave} size="xs" color="yellow" />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4 }}>
          <AbilityScore name="DEXTERITY" score={dexterity} />
          <StatBox label={`DEX Save`} value={wisSave >= 0 ? `+${dexSave}` : wisSave} size="xs" color="yellow" />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4 }}>
          <AbilityScore name="CONSTITUTION" score={constitution} />
          <StatBox label={`CON Save`} value={wisSave >= 0 ? `+${conSave}` : wisSave} size="xs" color="yellow" />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4 }}>
          <AbilityScore name="INTELLIGENCE" score={intelligence} />
          <StatBox label={`INT Save`} value={wisSave >= 0 ? `+${intSave}` : wisSave} size="xs" color="yellow" />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4 }}>
          <AbilityScore name="WISDOM" score={wisdom} />
          <StatBox label={`WIS Save`} value={wisSave >= 0 ? `+${wisSave}` : wisSave} size="xs" color="yellow" />
          
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 4 }}>
          <AbilityScore name="CHARISMA" score={charisma} />
          <StatBox label={`CHA Save`} value={wisSave >= 0 ? `+${chaSave}` : wisSave} size="xs" color="yellow" />
        </Grid.Col>
      </Grid>
      <Button fullWidth mt="md" variant="light" color="violet" onClick={() => setOpened(!opened)}>
        {opened ? "Hide Chart" : "Show Chart"}
      </Button>
      {/* Radar Chart */}

      <Collapse in={opened} transitionDuration={300}>
      <RadarChart
        h={"35vh"}
        w={"100%"}
        data={strength && dexterity && constitution && intelligence && wisdom && charisma ? [
          { ability: 'STR', score: strength },
          { ability: 'DEX', score: dexterity },
          { ability: 'CON', score: constitution },
          { ability: 'INT', score: intelligence },
          { ability: 'WIS', score: wisdom },
          { ability: 'CHA', score: charisma },
        ] : [{ ability: 'No Data', score: 0 }]}

        dataKey="ability"
        series={[
          { name: "score", color: "cyan.6", opacity: 0 },
        ]}
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
      </Collapse>
    </ExpandableSection> 
  );
}
