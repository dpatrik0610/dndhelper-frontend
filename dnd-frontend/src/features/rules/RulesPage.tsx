import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Grid, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { getRuleDetailMock, getRulesListMock } from "@services/ruleService";
import { RuleCategory, type RuleDetail, type RuleSnippet } from "@appTypes/Rules/Rule";
import { RulesHeader } from "./components/RulesHeader";
import { RulesFilters } from "./components/RulesFilters";
import { RulesList } from "./components/RulesList";
import { RuleDetailDrawer } from "./components/RuleDetailDrawer";
import { ComingSoonCard } from "./components/ComingSoonCard";
import { ruleTopics } from "./constants";

export default function RulesPage() {
  const [topic, setTopic] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 250);
  const [rules, setRules] = useState<RuleSnippet[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<RuleDetail | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const palette = {
    border: "rgba(140, 120, 255, 0.35)",
    cardBg: "rgba(20, 18, 40, 0.65)",
    textDim: "rgba(220, 220, 255, 0.7)",
  };

  const cardStyle = {
    background: palette.cardBg,
    borderColor: palette.border,
  };

  useEffect(() => {
    const load = async () => {
      const res = await getRulesListMock();
      setRules(res.items);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setSelectedDetail(null);
      return;
    }
    const loadDetail = async () => {
      const detail = await getRuleDetailMock(selectedSlug);
      setSelectedDetail(detail);
    };
    void loadDetail();
  }, [selectedSlug]);

  const displayedRules = useMemo(() => {
    if (!rules?.length) return [];
    const topicNormalized = topic.toLowerCase();
    const hasTopic = topic !== "all";
    const search = debouncedSearch.trim().toLowerCase();

    return rules.filter((rule) => {
      const sourceLabel = rule.source?.title?.toLowerCase() ?? "";
      const matchTopic =
        !hasTopic ||
        rule.category.toString().toLowerCase() === topicNormalized ||
        rule.tags.some((tag) => tag.toLowerCase() === topicNormalized) ||
        sourceLabel.includes(topicNormalized);

      if (!matchTopic) return false;

      if (!search) return true;
      const haystack = `${rule.title} ${rule.summary} ${rule.category} ${rule.tags.join(" ")}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [rules, topic, debouncedSearch]);

  const drawerSections = useMemo(() => {
    if (!selectedDetail) return [];
    if (selectedDetail.category === RuleCategory.Combat) {
      return [
        {
          title: "Combat flow",
          color: "red",
          bullets: [
            "Start of turn: resolve ongoing effects (e.g., damage over time, saves).",
            "Movement: split around actions; difficult terrain doubles cost.",
            "Action: attack, cast a spell, dash, disengage, dodge, help, hide, ready, search, or interact.",
            "Bonus action: only if a feature/spell grants one; you get at most one.",
            "Reaction: off-turn responses; refreshes at the start of your turn.",
          ],
        },
        {
          title: "Position & cover",
          color: "orange",
          bullets: [
            "Half cover: +2 to AC and Dexterity saves; three-quarters: +5; total cover blocks targeting.",
            "Reach weapons threaten further; opportunity attacks trigger on leaving reach.",
            "Prone: melee attacks from 5 ft have advantage; ranged attacks have disadvantage.",
          ],
        },
      ];
    }
    if (selectedDetail.category === RuleCategory.Magic) {
      return [
        {
          title: "Spellcasting essentials",
          color: "grape",
          bullets: [
            "Components: verbal (audible), somatic (free hand), material/focus (costly materials consumed).",
            "Concentration: one at a time; Con save on damage (DC 10 or half damage). Incapacitated ends it.",
            "Rituals: +10 minutes, no slot if the spell has the ritual tag.",
            "Targeting: respect line of sight/effect; cover can boost AC vs. attack rolls.",
          ],
        },
        {
          title: "Areas & saves",
          color: "violet",
          bullets: [
            "Areas: cones emanate from you; lines stretch from an edge; spheres/cylinders have radii.",
            "Save DC: 8 + proficiency + casting mod; attack rolls use your spell attack bonus.",
            "Damage on save: many spells halve on a successful save (per spell text).",
          ],
        },
      ];
    }
    if (selectedDetail.category === RuleCategory.Status) {
      return [
        {
          title: "Damage & healing",
          color: "teal",
          bullets: [
            "Apply resistances/vulnerabilities after total damage is rolled.",
            "Temporary HP absorbs damage first and doesn't stack—keep the highest pool.",
            "At 0 HP: start death saves (3 successes stabilize; 3 failures = death). Nat 20: to 1 HP. Nat 1: two failures.",
            "Healing from 0 removes the dying state; excess doesn't convert to temp HP.",
          ],
        },
        {
          title: "Common conditions",
          color: "cyan",
          bullets: [
            "Grappled: speed 0; ends if the grappler is incapacitated or you're moved out of reach.",
            "Restrained: speed 0, attacks against you have advantage, your attacks have disadvantage, Dex saves at disadvantage.",
            "Invisible: unseen without magic; attacks against you have disadvantage, your attacks have advantage.",
          ],
        },
      ];
    }
    return [];
  }, [selectedDetail]);

  const summaryStats = useMemo(() => {
    const total = rules.length;
    const byCategory = rules.reduce<Record<string, number>>((acc, rule) => {
      const key = rule.category.toString();
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const tagCounts = rules.reduce<Record<string, number>>((acc, rule) => {
      rule.tags.forEach((t) => {
        const key = t.toLowerCase();
        acc[key] = (acc[key] ?? 0) + 1;
      });
      return acc;
    }, {});
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return { total, byCategory, topTags };
  }, [rules]);

  return (
    <Box p={isMobile ? "xs" : "md"} m={isMobile ? "0 auto" : "0 auto"} maw={isMobile ? "100%" : 1400}>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12 }}>
          <Stack gap="lg">
            <RulesHeader paletteTextDim={palette.textDim} />
            <RulesFilters
              topics={ruleTopics}
              topic={topic}
              onTopicChange={(value) => setTopic((prev) => (prev === value ? "all" : value))}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              palette={palette}
              cardStyle={cardStyle}
            />
            <Paper withBorder radius="md" p="lg" shadow="sm" style={cardStyle}>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <Stack gap={4}>
                  <Text fw={700} size="sm">
                    Library snapshot
                  </Text>
                  <Text size="sm" c={palette.textDim}>
                    {summaryStats.total} rules across {Object.keys(summaryStats.byCategory).length} categories.
                  </Text>
                  <Group gap={6} wrap="wrap">
                    {Object.entries(summaryStats.byCategory).map(([cat, count]) => (
                      <Badge key={cat} size="sm" variant="light" color="grape">
                        {cat}: {count}
                      </Badge>
                    ))}
                  </Group>
                </Stack>

                <Stack gap={4}>
                  <Text fw={700} size="sm">
                    Popular tags
                  </Text>
                  <Group gap={6} wrap="wrap">
                    {summaryStats.topTags.map(([tag, count]) => (
                      <Badge key={tag} size="sm" variant="outline" color="violet">
                        {tag} ({count})
                      </Badge>
                    ))}
                  </Group>
                </Stack>

                <Stack gap={4}>
                  <Text fw={700} size="sm">
                    How to filter
                  </Text>
                  <Text size="sm" c={palette.textDim}>
                    Pick a topic, then refine with search. Results stay put while the drawer shows details.
                  </Text>
                </Stack>
              </SimpleGrid>
            </Paper>
            <RulesList
              rules={displayedRules}
              paletteTextDim={palette.textDim}
              cardStyle={cardStyle}
              onOpen={setSelectedSlug}
              activeTopic={topic !== "all" ? topic : undefined}
              searchTerm={debouncedSearch}
              matchCount={displayedRules.length}
            />
            <ComingSoonCard paletteTextDim={palette.textDim} cardStyle={cardStyle} />
          </Stack>
        </Grid.Col>

      </Grid>

      <RuleDetailDrawer
        opened={!!selectedSlug}
        onClose={() => setSelectedSlug(null)}
        isMobile={isMobile}
        detail={selectedDetail}
        sections={drawerSections}
        paletteTextDim={palette.textDim}
        cardStyle={cardStyle}
      />
    </Box>
  );
}
