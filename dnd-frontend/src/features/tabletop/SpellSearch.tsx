import { useEffect, useState } from "react";
import { ActionIcon, Autocomplete, Group, Loader, Text, Tooltip } from "@mantine/core";
import { IconBook2, IconSearch } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { SpellModal } from "@features/profile/components/modals/SpellModal";
import { getSpellById, getSpellNames } from "@services/spellService";
import { useSpellStore } from "@store/spell/spellStore";

/** Book icon in the top bar that grows into a rounded spell search; picking a spell opens the usual spell modal. */
export function SpellSearch() {
  const names = useSpellStore((s) => s.spellNames);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Names are cached in the spell store; fetch once the first time the search opens.
  useEffect(() => {
    if (!open || names.length) return;
    getSpellNames()
      .then((list) => useSpellStore.getState().setSpellNames(list ?? []))
      .catch(() => showNotification({ message: "Couldn't load the spell list.", color: "red" }));
  }, [open, names.length]);

  const levelOf = new Map(names.map((n) => [n.name, n.level]));
  const options = [...new Set(names.map((n) => n.name))];

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const pick = async (name: string) => {
    const hit = names.find((n) => n.name === name);
    if (!hit) return;
    setLoading(true);
    const spell = await getSpellById(hit.id).catch(() => null);
    setLoading(false);
    if (!spell) {
      showNotification({ message: `Couldn't load ${name}.`, color: "red" });
      return;
    }
    useSpellStore.getState().setCurrentSpell(spell);
    setModalOpen(true);
    close();
  };

  return (
    <>
      <div className={`tt-spell-search${open ? " open" : ""}`}>
        {open ? (
          <Autocomplete
            autoFocus
            size="xs"
            radius="xl"
            placeholder={names.length ? "Search spells…" : "Loading spells…"}
            value={query}
            onChange={setQuery}
            data={options}
            limit={12}
            // Wider than the field: long spell names get room, and wrap instead of spilling out.
            comboboxProps={{ width: 300, position: "bottom-start" }}
            onOptionSubmit={(name) => void pick(name)}
            onBlur={() => !query && !loading && close()}
            onKeyDown={(e) => e.key === "Escape" && close()}
            leftSection={<IconSearch size={14} />}
            rightSection={loading ? <Loader size={12} /> : null}
            renderOption={({ option }) => (
              <Group justify="space-between" wrap="nowrap" w="100%" gap="xs">
                <Text size="sm" miw={0}>
                  {option.value}
                </Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {levelOf.get(option.value) ? `Lvl ${levelOf.get(option.value)}` : "Cantrip"}
                </Text>
              </Group>
            )}
            classNames={{ root: "tt-spell-field", input: "tt-spell-input" }}
            aria-label="Search spells"
          />
        ) : (
          <Tooltip label="Spell lookup">
            <ActionIcon variant="subtle" color="gray" onClick={() => setOpen(true)} aria-label="Search spells">
              <IconBook2 size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
      <SpellModal opened={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
