import { useState } from "react";
import { NumberInput } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { formatCostToDisplay, formatSilverToDisplay } from "@utils/currencyConverter";
import { itemKind } from "@utils/itemKind";
import { ShopItemCard } from "@features/shop/components/ShopItemCard";
import { describeStats } from "@features/shop/itemStats";
import { offerKey, type OfferLine, type OfferSide } from "@features/shop/offer";
import classes from "@features/shop/styles/OfferPanel.module.css";
import cardClasses from "@features/shop/styles/ShopItemCard.module.css";

interface OfferPanelProps {
    lines: OfferLine[];
    equipments: Equipment[];
    priceMultiplier: number;
    fairValueSp: number;
    busy: boolean;
    onSet: (line: OfferLine) => void;
    onClear: () => void;
    onSubmit: (offeredPriceGp: number) => Promise<boolean>;
}

interface Coin {
    playerPays: boolean;
    gp: number;
    sp: number;
}

const coinFromSp = (signedSp: number): Coin => ({
    playerPays: signedSp >= 0,
    gp: Math.floor(Math.abs(signedSp) / 100),
    sp: Math.abs(signedSp) % 100,
});

const countOf = (lines: OfferLine[]) => lines.reduce((sum, l) => sum + l.quantity, 0);

export function OfferPanel({ lines, equipments, priceMultiplier, fairValueSp, busy, onSet, onClear, onSubmit }: OfferPanelProps) {
    const [manualCoin, setManualCoin] = useState<Coin | null>(null);
    const coin = manualCoin ?? coinFromSp(fairValueSp);
    const editCoin = (patch: Partial<Coin>) => setManualCoin({ ...coin, ...patch });

    const byId = new Map(equipments.map(e => [e.id, e]));
    const give = lines.filter(l => l.side === "give");
    const want = lines.filter(l => l.side === "want");

    const submit = async () => {
        const totalGp = coin.gp + coin.sp / 100;
        if (await onSubmit(coin.playerPays ? totalGp : -totalGp)) setManualCoin(null);
    };

    const renderSide = (side: OfferSide, sideLines: OfferLine[], title: string, empty: string) => (
        <div className={classes.side} aria-label={title} role="group">
            <div className={classes.sideHeader}>
                <span className={classes.sideTitle}>{title}</span>
                <span className={classes.sideCount}>{countOf(sideLines)} item{countOf(sideLines) === 1 ? "" : "s"}</span>
            </div>
            {sideLines.length === 0 ? (
                <div className={classes.empty}>{empty}</div>
            ) : (
                <div className={`${cardClasses.grid} ${classes.sideGrid}`}>
                    {sideLines.map(line => {
                        const equipment = byId.get(line.equipmentId);
                        return (
                            <ShopItemCard
                                key={offerKey(line.side, line.equipmentId, line.sourceInventoryId)}
                                name={line.name}
                                kind={itemKind({ ...equipment, name: line.name })}
                                tier={equipment?.tier}
                                meta={describeStats(equipment)}
                                price={equipment?.cost ? (side === "want" ? formatCostToDisplay(equipment.cost, priceMultiplier) : `worth ${formatCostToDisplay(equipment.cost)}`) : null}
                                onOpen={() => undefined}
                                offer={{ picked: line.quantity, max: line.max, onChange: quantity => onSet({ ...line, quantity }) }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <section className={classes.panel} aria-label="Trade offer">
            <div className={classes.header}>
                <div>
                    <h3 className={classes.title}>Trade offer</h3>
                    <p className={classes.subtitle}>Pick items from the merchant and your bag. Everything here goes to the shopkeeper as one offer.</p>
                </div>
                {lines.length > 0 && (
                    <button type="button" className={`glass-btn-secondary ${classes.smallBtn}`} onClick={onClear}>
                        Clear
                    </button>
                )}
            </div>

            <div className={classes.sides}>
                {renderSide("give", give, "You give", "Pick items from your bag to offer them.")}
                <div className={classes.swap} aria-hidden>
                    <IconArrowsExchange size={20} />
                </div>
                {renderSide("want", want, "You get", "Pick items from the merchant you want.")}
            </div>

            <div className={classes.footer}>
                <div className={classes.direction} role="group" aria-label="Who pays">
                    <button type="button" className={`${coin.playerPays ? "glass-btn-primary" : "glass-btn-secondary"} ${classes.smallBtn}`} onClick={() => editCoin({ playerPays: true })} aria-pressed={coin.playerPays}>
                        I pay
                    </button>
                    <button type="button" className={`${!coin.playerPays ? "glass-btn-primary" : "glass-btn-secondary"} ${classes.smallBtn}`} onClick={() => editCoin({ playerPays: false })} aria-pressed={!coin.playerPays}>
                        They pay me
                    </button>
                </div>
                <div className={classes.coins}>
                    <NumberInput size="xs" w={90} label="Gold" min={0} value={coin.gp} onChange={v => editCoin({ gp: Number(v) || 0 })} classNames={{ input: "glass-input" }} />
                    <NumberInput size="xs" w={80} label="Silver" min={0} max={99} value={coin.sp} onChange={v => editCoin({ sp: Number(v) || 0 })} classNames={{ input: "glass-input" }} />
                </div>
                <span className={classes.hint}>
                    List value: {fairValueSp === 0 ? "even" : `${fairValueSp > 0 ? "you pay" : "they pay you"} ${formatSilverToDisplay(Math.abs(fairValueSp))}`}
                    {manualCoin && (
                        <button type="button" className={classes.link} onClick={() => setManualCoin(null)}>reset</button>
                    )}
                </span>
                <button type="button" className={`glass-btn-primary ${classes.sendBtn}`} onClick={submit} disabled={busy || lines.length === 0}>
                    {busy ? "Sending…" : "Send offer"}
                </button>
            </div>
        </section>
    );
}

export function OfferSummaryBar({ lines, onView }: { lines: OfferLine[]; onView: () => void }) {
    if (lines.length === 0) return null;
    return (
        <div className={classes.bar} role="region" aria-label="Offer in progress">
            <span className={classes.barText}>
                Give {countOf(lines.filter(l => l.side === "give"))} · Get {countOf(lines.filter(l => l.side === "want"))}
            </span>
            <button type="button" className={`glass-btn-primary ${classes.smallBtn}`} onClick={onView}>
                View offer
            </button>
        </div>
    );
}
