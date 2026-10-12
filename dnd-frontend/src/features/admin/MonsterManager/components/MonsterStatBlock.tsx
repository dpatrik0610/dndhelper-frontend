import { Badge, Divider, Group, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { Monster, MonsterFeature } from "@appTypes/Monster";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { SrdCredit } from "@components/common/SrdCredit";
import { signed } from "@utils/effects";
import { ABILITY_KEYS, abilityMod, bonusList, crLabel, crXp, proficiencyBonus, speedText, srdVersion } from "@utils/monster";

/** The classic stat block, read-only. */
export function MonsterStatBlock({ monster: m }: { monster: Monster }) {
  const srd = srdVersion(m.source);
  const kind = [m.size, m.type && `${m.type}${m.tags.length ? ` (${m.tags.join(", ")})` : ""}`].filter(Boolean).join(" ");
  const lines: [string, string][] = [
    ["Saving Throws", bonusList(m.savingThrows, ABILITY_KEYS)],
    ["Skills", bonusList(m.skills)],
    ["Damage Vulnerabilities", m.damageVulnerabilities.join("; ")],
    ["Damage Resistances", m.damageResistances.join("; ")],
    ["Damage Immunities", m.damageImmunities.join("; ")],
    ["Condition Immunities", m.conditionImmunities.join(", ")],
    ["Senses", [...m.senses, `passive Perception ${m.passivePerception}`].join(", ")],
    ["Languages", m.languages.join(", ") || "—"],
    ["Challenge", `${crLabel(m.challengeRating)} (${crXp(m.challengeRating).toLocaleString()} XP) · Proficiency ${signed(proficiencyBonus(m.challengeRating))}`],
  ];

  return (
    <Stack gap="sm">
      <Group align="flex-start" wrap="nowrap" gap="md">
        {m.imageUrl && <Image src={m.imageUrl} alt="" w={112} h={112} fit="contain" radius="md" />}
        <Stack gap={4} style={{ flex: 1 }}>
          <Title order={2} c="red.2">{m.name}</Title>
          <Text size="sm" fs="italic" c="dimmed">
            {[kind, m.alignment].filter(Boolean).join(", ")}
          </Text>
          <Group gap={6}>
            {m.source && <Badge variant="light" color="gray">{m.source}</Badge>}
            <Badge variant="filled" color="orange">CR {crLabel(m.challengeRating)}</Badge>
            {m.isNpc && <Badge variant="dot" color="pink">NPC</Badge>}
          </Group>
        </Stack>
      </Group>

      <Divider color="red.9" />
      <Line label="Armor Class" value={`${m.armorClass}${m.armorNote ? ` (${m.armorNote})` : ""}`} />
      <Line label="Hit Points" value={`${m.hitPoints}${m.hitDice ? ` (${m.hitDice})` : ""}`} />
      <Line label="Speed" value={speedText(m.speed)} />
      <Divider color="red.9" />

      <SimpleGrid cols={6} spacing={4}>
        {ABILITY_KEYS.map((key) => (
          <Stack key={key} gap={0} align="center">
            <Text size="xs" fw={700} tt="uppercase" c="red.3">{key}</Text>
            <Text size="sm">
              {m.abilityScores[key]} ({signed(abilityMod(m.abilityScores[key]))})
            </Text>
          </Stack>
        ))}
      </SimpleGrid>
      <Divider color="red.9" />

      {lines.filter(([, value]) => value).map(([label, value]) => <Line key={label} label={label} value={value} />)}

      <Features features={m.traits} />
      <Features title="Actions" features={m.actions} />
      <Features title="Bonus Actions" features={m.bonusActions} />
      <Features title="Reactions" features={m.reactions} />
      <Features title="Legendary Actions" features={m.legendaryActions} />

      {m.description && (
        <>
          <Divider label="Lore" labelPosition="left" color="red.9" />
          <MarkdownRenderer content={m.description} />
        </>
      )}

      {srd && <SrdCredit versions={[srd]} />}
    </Stack>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <Text size="sm">
      <Text span fw={700} c="red.2">{label}</Text> {value}
    </Text>
  );
}

function Features({ title, features }: { title?: string; features: MonsterFeature[] }) {
  if (features.length === 0) return null;
  return (
    <Stack gap={6}>
      {title && <Divider label={title} labelPosition="left" color="red.9" styles={{ label: { fontSize: 14, fontWeight: 700, color: "var(--mantine-color-red-3)" } }} />}
      {features.map((f, i) => (
        <Text key={`${f.name}-${i}`} size="sm" style={{ whiteSpace: "pre-line" }}>
          <Text span fw={700} fs="italic">{f.name}.</Text> {f.description}
        </Text>
      ))}
    </Stack>
  );
}
