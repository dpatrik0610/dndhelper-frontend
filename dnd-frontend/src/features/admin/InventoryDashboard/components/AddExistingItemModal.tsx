import { Button, Loader, MultiSelect, ScrollArea, Select, Switch, TextInput } from "@mantine/core";
import { IconArrowsSort, IconCoins, IconFlame, IconPlus, IconScale, IconSearch, IconTags } from "@tabler/icons-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { EQUIPMENT_TIERS, type Equipment } from "@appTypes/Equipment/Equipment";
import { BaseModal } from "@components/BaseModal";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { tierAccent } from "@features/inventory/components/styles/equipmentTheme";
import { formatCostToDisplay } from "@utils/currencyConverter";
import { useIsMobile } from "@hooks/useIsMobile";
import { EMPTY_FILTERS, filterEquipment, isFiltered, type EquipmentFilters, type EquipmentSort } from "./equipmentFilter";
import styles from "@styles/AddExistingItemModal.module.css";

const PAGE = 50;

const SORT_OPTIONS: { value: EquipmentSort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "tier", label: "Rarity" },
  { value: "cost", label: "Cost" },
];

const selectClasses = { input: "glassy-input", dropdown: "glassy-dropdown", option: "glassy-option" };
const switchClasses = { root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb", label: styles.switchLabel };

const tierStyle = (tier?: string) => ({ "--tier": tierAccent(tier) }) as CSSProperties;

export function AddExistingItemModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const isMobile = useIsMobile();
  const { equipments, loadAll } = useAdminEquipmentStore();
  const { addExisting, selected } = useAdminInventoryStore();

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<EquipmentFilters>(EMPTY_FILTERS);
  const [limit, setLimit] = useState(PAGE);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, [opened, loadAll]);

  const update = (patch: Partial<EquipmentFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setLimit(PAGE);
  };

  const toggleTier = (tier: string) =>
    update({ tiers: filters.tiers.includes(tier) ? filters.tiers.filter((t) => t !== tier) : [...filters.tiers, tier] });

  const allTags = useMemo(
    () => [...new Set(equipments.flatMap((e) => e.tags ?? []))].filter(Boolean).sort(),
    [equipments]
  );
  const results = useMemo(() => filterEquipment(equipments, filters), [equipments, filters]);
  const owned = useMemo(
    () => new Map((selected?.items ?? []).map((i) => [i.equipmentId, i.quantity ?? 0])),
    [selected]
  );

  const add = async (eq: Equipment) => {
    if (!eq.id || adding) return;
    setAdding(eq.id);
    try {
      await addExisting(eq.id, quantities[eq.id] ?? 1);
    } finally {
      setAdding(null);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={selected?.name ? `Add to ${selected.name}` : "Add existing item"}
      size="xl"
      showSaveButton={false}
      showCancelButton={false}
    >
      <div className={styles.filters}>
        <div className={styles.toolbar}>
          <TextInput
            aria-label="Search items"
            placeholder="Search by name or tag"
            leftSection={<IconSearch size={15} />}
            value={filters.query}
            onChange={(e) => update({ query: e.currentTarget.value })}
            classNames={{ input: "glassy-input" }}
            className={styles.search}
            data-autofocus
          />
          <Select
            aria-label="Sort by"
            leftSection={<IconArrowsSort size={15} />}
            data={SORT_OPTIONS}
            value={filters.sort}
            onChange={(v) => v && update({ sort: v as EquipmentSort })}
            allowDeselect={false}
            classNames={selectClasses}
            className={styles.sort}
          />
        </div>

        <fieldset className={styles.tiers} aria-label="Rarity">
          {EQUIPMENT_TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className={styles.tierChip}
              style={tierStyle(tier)}
              aria-pressed={filters.tiers.includes(tier)}
              onClick={() => toggleTier(tier)}
            >
              <span className={styles.tierDot} />
              {tier}
            </button>
          ))}
        </fieldset>

        <div className={styles.toolbar}>
          <MultiSelect
            aria-label="Tags"
            placeholder={filters.tags.length ? undefined : "Any tag"}
            leftSection={<IconTags size={15} />}
            data={allTags}
            value={filters.tags}
            onChange={(tags) => update({ tags })}
            searchable
            clearable
            classNames={selectClasses}
            className={styles.search}
          />
          <Switch
            label="Custom only"
            checked={filters.customOnly}
            onChange={(e) => update({ customOnly: e.currentTarget.checked })}
            classNames={switchClasses}
          />
        </div>
      </div>

      <div className={styles.summary}>
        <span>
          {results.length === equipments.length
            ? `${results.length} items`
            : `${results.length} of ${equipments.length} items`}
        </span>
        {isFiltered(filters) && (
          <button type="button" className={styles.linkBtn} onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}>
            Clear filters
          </button>
        )}
      </div>

      {loading && equipments.length === 0 ? (
        <div className={styles.empty}>
          <Loader size="md" />
        </div>
      ) : results.length === 0 ? (
        <div className={styles.empty}>
          <span>No items match these filters.</span>
          {isFiltered(filters) && (
            <Button size="xs" className="glass-btn-secondary" onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea.Autosize mah={isMobile ? "calc(100dvh - 330px)" : "56vh"} type="hover" offsetScrollbars>
          <ul className={styles.list}>
            {results.slice(0, limit).map((eq) => {
              const have = owned.get(eq.id);
              return (
                <li key={eq.id} className={styles.row} style={tierStyle(eq.tier)}>
                  <div className={styles.info}>
                    <div className={styles.nameLine}>
                      <span className={styles.name}>{eq.name}</span>
                      <span className={styles.tierLabel}>{eq.tier ?? "Common"}</span>
                      {eq.isCustom && <span className={styles.custom}>Custom</span>}
                    </div>
                    <div className={styles.meta}>
                      <span><IconCoins size={13} />{formatCostToDisplay(eq.cost)}</span>
                      {eq.weight != null && <span><IconScale size={13} />{eq.weight} lb</span>}
                      {eq.damage && (
                        <span><IconFlame size={13} />{eq.damage.damageDice} {eq.damage.damageType?.name}</span>
                      )}
                      {eq.tags?.map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    {have ? <span className={styles.owned}>Has {have}</span> : null}
                    <FormNumberInput
                      value={quantities[eq.id!] ?? 1}
                      onChange={(v) => setQuantities((p) => ({ ...p, [eq.id!]: Math.max(1, v) }))}
                      min={1}
                      max={999}
                      hideControls
                      classNames={{ input: `glassy-input ${styles.qty}` }}
                    />
                    <Button
                      size="xs"
                      className="glass-btn-primary"
                      leftSection={<IconPlus size={13} />}
                      loading={adding === eq.id}
                      disabled={!!adding && adding !== eq.id}
                      onClick={() => add(eq)}
                      aria-label={`Add ${eq.name}`}
                    >
                      Add
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {limit < results.length && (
            <div className={styles.more}>
              <Button size="xs" className="glass-btn-secondary" onClick={() => setLimit((l) => l + PAGE)}>
                Show {Math.min(PAGE, results.length - limit)} more
              </Button>
            </div>
          )}
        </ScrollArea.Autosize>
      )}
    </BaseModal>
  );
}
