import { Fragment, useMemo, useState, type ReactNode } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { ITEM_KIND_LABEL, type ItemKind } from "@utils/itemKind";
import { ITEM_KIND_ICON } from "@features/shop/itemKindIcons";
import classes from "@features/shop/styles/ItemShelf.module.css";
import cardClasses from "@features/shop/styles/ShopItemCard.module.css";

export interface ShelfEntry {
    key: string;
    name: string;
    kind: ItemKind;
}

interface ItemShelfProps<T extends ShelfEntry> {
    title: string;
    headerExtra?: ReactNode;
    entries: T[];
    renderCard: (entry: T) => ReactNode;
    emptyText: string;
}

export function ItemShelf<T extends ShelfEntry>({ title, headerExtra, entries, renderCard, emptyText }: ItemShelfProps<T>) {
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState<ItemKind | null>(null);

    const kindCounts = useMemo(() => {
        const counts = new Map<ItemKind, number>();
        entries.forEach(e => counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1));
        return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    }, [entries]);

    const activeKind = kind && kindCounts.some(([k]) => k === kind) ? kind : null;
    const needle = query.trim().toLowerCase();
    const visible = entries.filter(e => (!activeKind || e.kind === activeKind) && (!needle || e.name.toLowerCase().includes(needle)));

    return (
        <section className={classes.panel} aria-label={title}>
            <div className={classes.header}>
                <h3 className={classes.title}>
                    {title}
                    <span className={classes.count}>{entries.length}</span>
                </h3>
                {headerExtra}
            </div>

            {entries.length > 0 && (
                <>
                    <TextInput
                        size="xs"
                        placeholder={`Search ${title.toLowerCase()}…`}
                        value={query}
                        onChange={e => setQuery(e.currentTarget.value)}
                        leftSection={<IconSearch size={14} />}
                        classNames={{ input: "glass-input" }}
                        aria-label={`Search ${title}`}
                    />

                    {kindCounts.length > 1 && (
                        <div className={classes.chips} role="group" aria-label="Filter by type">
                            <button
                                type="button"
                                className={`${classes.chip} ${!activeKind ? classes.chipActive : ""}`}
                                onClick={() => setKind(null)}
                                aria-pressed={!activeKind}
                            >
                                All <span className={classes.chipCount}>{entries.length}</span>
                            </button>
                            {kindCounts.map(([k, count]) => {
                                const KindIcon = ITEM_KIND_ICON[k];
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        className={`${classes.chip} ${activeKind === k ? classes.chipActive : ""}`}
                                        onClick={() => setKind(activeKind === k ? null : k)}
                                        aria-pressed={activeKind === k}
                                    >
                                        <KindIcon size={13} />
                                        {ITEM_KIND_LABEL[k]} <span className={classes.chipCount}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            <div className={classes.scroll}>
                {visible.length === 0 ? (
                    <div className={classes.empty}>{entries.length === 0 ? emptyText : "Nothing matches your search."}</div>
                ) : (
                    <div className={cardClasses.grid}>{visible.map(e => <Fragment key={e.key}>{renderCard(e)}</Fragment>)}</div>
                )}
            </div>
        </section>
    );
}
