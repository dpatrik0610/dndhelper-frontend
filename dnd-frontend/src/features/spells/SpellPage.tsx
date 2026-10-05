import { useEffect, useState } from "react";
import { ActionIcon, Box, Button, Grid, Group, Skeleton, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconArrowLeft, IconBook2, IconPencil, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import { useSpellStore } from "@store/spell/spellStore";
import { loadSpells } from "@utils/loadSpells";
import { getSpellById } from "@services/spellService";
import { useIsMobile } from "@hooks/useIsMobile";
import { useIsDm } from "@store/auth/authSelectors";
import type { Spell } from "@appTypes/Spell";
import { SpellIndex } from "./components/SpellIndex";
import { SpellCard } from "./components/SpellCard";
import { SpellEditor } from "./components/SpellEditor";
import classes from "./Spellbook.module.css";

export default function SpellPage() {
  const { spellName } = useParams<{ spellName?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isDm = useIsDm();

  const spellNames = useSpellStore((s) => s.spellNames);
  const currentSpell = useSpellStore((s) => s.currentSpell);
  const setCurrentSpell = useSpellStore((s) => s.setCurrentSpell);

  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  // null = closed, "new" = create, otherwise the spell being edited.
  const [editing, setEditing] = useState<Spell | "new" | null>(null);

  useEffect(() => {
    if (spellNames.length === 0) void loadSpells();
  }, [spellNames.length]);

  // URL is the source of truth for which spell is open.
  const urlSpell = spellName ? spellNames.find((s) => s.name === spellName) : undefined;
  const currentId = currentSpell?.id;

  useEffect(() => {
    if (!urlSpell || urlSpell.id === currentId) return;
    let cancelled = false;
    setLoading(true);
    getSpellById(urlSpell.id)
      .then((spell) => !cancelled && setCurrentSpell(spell))
      .catch((err) => console.error(`Failed to load spell ${urlSpell.name}`, err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [urlSpell, currentId, setCurrentSpell]);

  const reload = async () => {
    setReloading(true);
    try {
      await loadSpells();
      if (currentId) setCurrentSpell(await getSpellById(currentId));
    } finally {
      setReloading(false);
    }
  };

  const openSpell = (name: string) => navigate(`/spells/${encodeURIComponent(name)}`);

  const onSaved = async (spell: Spell) => {
    setEditing(null);
    setCurrentSpell(spell);
    await loadSpells();
    openSpell(spell.name);
  };

  const onDeleted = async () => {
    setEditing(null);
    setCurrentSpell(null);
    await loadSpells();
    navigate("/spells");
  };

  const notFound = !!spellName && spellNames.length > 0 && !urlSpell;
  const showingSpell = spellName ? currentSpell?.name === spellName : !!currentSpell;

  const detail = notFound ? (
    <div className={classes.empty}>
      <IconBook2 size={40} stroke={1.2} />
      <Text fw={600}>“{spellName}” isn't in the spellbook.</Text>
    </div>
  ) : loading || (spellName && !showingSpell) ? (
    <Stack gap="md" className={classes.card}>
      <Group gap="md">
        <Skeleton h={52} w={52} radius="md" />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton h={24} w="60%" />
          <Skeleton h={14} w="35%" />
        </Stack>
      </Group>
      <Skeleton h={64} />
      <Skeleton h={14} />
      <Skeleton h={14} />
      <Skeleton h={14} w="80%" />
    </Stack>
  ) : showingSpell ? (
    <SpellCard />
  ) : (
    <div className={classes.empty}>
      <IconBook2 size={44} stroke={1.2} style={{ color: "var(--theme-color-accent-primary)" }} />
      <Text fw={600} c="var(--theme-color-text-primary)">
        Open a spell
      </Text>
      <Text size="sm" maw={280}>
        Search by name, or narrow the list by level and school of magic.
      </Text>
    </div>
  );

  return (
    <Box maw={1600} mx="auto" w="100%" p={isMobile ? "sm" : undefined}>
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <IconBook2 size={28} stroke={1.5} style={{ color: "var(--theme-color-accent-primary)" }} />
          <div>
            <Title order={1} className="narrative-title" fz={20} c="var(--theme-color-text-primary)">
              Spellbook
            </Title>
            <Text size="xs" c="var(--theme-color-text-secondary)">
              {spellNames.length} spells
            </Text>
          </div>
        </Group>
        <Group gap="xs" wrap="nowrap">
          {isDm && showingSpell && currentSpell && (
            <Tooltip label="Edit spell" withArrow>
              <ActionIcon variant="subtle" size="lg" onClick={() => setEditing(currentSpell)} aria-label="Edit spell">
                <IconPencil size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          {isDm && (
            <Tooltip label="New spell" withArrow>
              <ActionIcon variant="subtle" size="lg" onClick={() => setEditing("new")} aria-label="New spell">
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Reload spells" withArrow>
            <ActionIcon variant="subtle" size="lg" onClick={reload} loading={reloading} aria-label="Reload spells">
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {isDm && (
        <SpellEditor
          opened={editing !== null}
          spell={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}

      {isMobile ? (
        spellName ? (
          <Stack gap="sm">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate("/spells")}
              w="fit-content"
              px={4}
            >
              All spells
            </Button>
            {detail}
          </Stack>
        ) : (
          <SpellIndex onSelect={openSpell} activeName={currentSpell?.name} />
        )
      ) : (
        <Grid gutter="lg" align="flex-start">
          <Grid.Col span={{ base: 12, md: 4, xl: 3 }} style={{ position: "sticky", top: 16 }}>
            <SpellIndex onSelect={openSpell} activeName={spellName} scrollHeight="calc(100vh - 290px)" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8, xl: 9 }}>{detail}</Grid.Col>
        </Grid>
      )}
    </Box>
  );
}
