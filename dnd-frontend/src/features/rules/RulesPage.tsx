import { useEffect } from "react";
import { Box, Grid, Group, Pagination, Stack } from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { getRuleDetail } from "@services/ruleService";
import { RulesHeader } from "./components/RulesHeader";
import { RulesFilters } from "./components/RulesFilters";
import { RulesList } from "./components/RulesList";
import { RuleDetailDrawer } from "./components/RuleDetailDrawer";
import { DataInfoCard } from "./components/DataInfoCard";
import { LibrarySnapshot } from "./components/LibrarySnapshot";
import "./rulesPage.css";
import { useRulesDataStore } from "./store/useRulesDataStore";
import { useRuleFilters } from "./hooks/useRuleFilters";
import { useRuleDrawerSections } from "./hooks/useRuleDrawerSections";
import { useRulesUiStore, type RulesUiState } from "./store/useRulesUiStore";

export default function RulesPage() {
  const topic = useRulesUiStore((s: RulesUiState) => s.topic);
  const searchTerm = useRulesUiStore((s: RulesUiState) => s.searchTerm);
  const selectedSlug = useRulesUiStore((s: RulesUiState) => s.selectedSlug);
  const selectedDetail = useRulesUiStore((s: RulesUiState) => s.selectedDetail);
  const setSelectedSlug = useRulesUiStore((s: RulesUiState) => s.setSelectedSlug);
  const setSelectedDetail = useRulesUiStore((s: RulesUiState) => s.setSelectedDetail);

  const [debouncedSearch] = useDebouncedValue(searchTerm, 250);
  const pageSize = 15;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { rules, topics, categories, initialized, loadData } = useRulesDataStore();
  const { filteredRules, paginatedRules, summaryStats, page, setPage } = useRuleFilters(
    rules,
    topic,
    debouncedSearch,
    pageSize,
  );
  const drawerSections = useRuleDrawerSections(selectedDetail);

  useEffect(() => {
    if (!initialized) void loadData();
  }, [initialized, loadData]);

  useEffect(() => {
    if (!selectedSlug) {
      setSelectedDetail(null);
      return;
    }
    const loadDetail = async () => {
      const detail = await getRuleDetail(selectedSlug);
      setSelectedDetail(detail);
    };
    void loadDetail();
  }, [selectedSlug, setSelectedDetail]);

  return (
    <Box p={isMobile ? "2" : "md"} m={isMobile ? "0 auto" : "0 auto"} maw={isMobile ? "100%" : 1400}>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12 }}>
          <Stack gap="lg">
            <RulesHeader />
            <RulesFilters />
            <LibrarySnapshot
              summaryStats={summaryStats}
              categories={categories}
            />
            <RulesList rules={paginatedRules} matchCount={filteredRules.length} />
            {filteredRules.length > pageSize && (
              <Group justify="center">
                <Pagination
                  value={page}
                  onChange={setPage}
                  total={Math.ceil(filteredRules.length / pageSize)}
                  size="sm"
                  color="grape"
                  radius="md"
                  withEdges
                  nextIcon={IconChevronRight}
                  previousIcon={IconChevronLeft}
                  classNames={{
                    control: "rules-pagination__control",
                    dots: "rules-pagination__dots",
                  }}
                />
              </Group>
            )}
            <DataInfoCard rulesCount={rules.length} topicsCount={topics.length} />
          </Stack>
        </Grid.Col>
      </Grid>

      <RuleDetailDrawer
        opened={!!selectedSlug}
        onClose={() => setSelectedSlug(null)}
        isMobile={isMobile}
        detail={selectedDetail}
        sections={drawerSections}
      />
    </Box>
  );
}
