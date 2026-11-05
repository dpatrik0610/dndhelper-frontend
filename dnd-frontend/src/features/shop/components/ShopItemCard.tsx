import type { CSSProperties, ReactNode } from "react";
import { IconCheck, IconMinus, IconPlus } from "@tabler/icons-react";
import { ITEM_KIND_LABEL, type ItemKind } from "@utils/itemKind";
import { tierAccent } from "@features/inventory/components/styles/equipmentTheme";
import { ITEM_KIND_ICON } from "@features/shop/itemKindIcons";
import classes from "@features/shop/styles/ShopItemCard.module.css";

interface ShopItemCardProps {
    name: string;
    kind: ItemKind;
    tier?: string;
    quantity?: number | null;
    quantityLabel?: string;
    meta?: string | null;
    price?: string | null;
    onOpen: () => void;
    actions?: ReactNode;
    offer?: {
        picked: number;
        max: number | null;
        onChange: (quantity: number) => void;
    };
}

export function ShopItemCard({ name, kind, tier, quantity, quantityLabel, meta, price, onOpen, actions, offer }: ShopItemCardProps) {
    const KindIcon = ITEM_KIND_ICON[kind];
    const picked = offer?.picked ?? 0;
    const atMax = offer?.max != null && picked >= offer.max;

    return (
        <div
            className={`${classes.card} ${picked > 0 ? classes.selected : ""}`}
            style={{ "--tier-accent": tierAccent(tier) } as CSSProperties}
            data-testid="shop-item-card"
        >
            <KindIcon className={classes.watermark} stroke={1.25} aria-hidden />

            <button
                type="button"
                className={classes.body}
                onClick={offer ? () => offer.onChange(picked > 0 ? 0 : 1) : onOpen}
                aria-label={offer ? `${picked > 0 ? "Remove" : "Add"} ${name} ${picked > 0 ? "from" : "to"} offer` : `Inspect ${name}`}
                aria-pressed={offer ? picked > 0 : undefined}
            >
                <span className={classes.top}>
                    <span className={classes.kind}>
                        <KindIcon size={13} stroke={1.8} />
                        {tier && tier !== "Common" ? tier : ITEM_KIND_LABEL[kind]}
                    </span>
                    {quantity != null && picked === 0 && (
                        <span className={classes.qty}>{quantityLabel ?? `×${quantity}`}</span>
                    )}
                </span>
                <span className={classes.name}>{name}</span>
                {meta && <span className={classes.meta}>{meta}</span>}
            </button>

            {picked > 0 && (
                <span className={classes.pickedBadge} aria-hidden>
                    <IconCheck size={13} stroke={3} />
                </span>
            )}

            <div className={classes.footer}>
                {price && <span className={classes.price}>{price}</span>}
                {offer ? (
                    picked > 0 ? (
                        <div className={classes.stepper}>
                            <button type="button" className={classes.stepBtn} onClick={() => offer.onChange(picked - 1)} aria-label={`One less ${name}`}>
                                <IconMinus size={14} />
                            </button>
                            <span className={classes.stepValue} aria-live="polite">{picked}</span>
                            <button type="button" className={classes.stepBtn} onClick={() => offer.onChange(picked + 1)} disabled={atMax} aria-label={`One more ${name}`}>
                                <IconPlus size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className={classes.actions}>
                            <button type="button" className={`glass-btn-secondary ${classes.actionBtn}`} onClick={() => offer.onChange(1)}>
                                Add
                            </button>
                        </div>
                    )
                ) : (
                    <div className={classes.actions}>{actions}</div>
                )}
            </div>
        </div>
    );
}
