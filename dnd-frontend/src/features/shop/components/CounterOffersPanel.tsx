import { Card, Group, Stack, Text, Title } from "@mantine/core";
import { describeTradeItems, type SellRequest, type Shop } from "@appTypes/Shop/Shop";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { formatSilverToDisplay } from "@utils/currencyConverter";

interface CounterOffersPanelProps {
    requests: SellRequest[];
    shops: Shop[];
    equipments: Equipment[];
    busyId: string | null;
    onRespond: (id: string, accept: boolean) => void;
}

const coinText = (gp: number, isTrade: boolean) => {
    const amount = formatSilverToDisplay(Math.round(Math.abs(gp) * 100));
    if (!isTrade) return amount;
    return gp < 0 ? `they pay ${amount}` : `you pay ${amount}`;
};

export function CounterOffersPanel({ requests, shops, equipments, busyId, onRespond }: CounterOffersPanelProps) {
    if (requests.length === 0) return null;

    return (
        <Card p="xs" mb="xs" bg="rgba(15, 12, 10, 0.45)" style={{ border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 8 }}>
            <Title order={3} c="amber.5" mb="xs" size="h5" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Counter-offers
            </Title>
            <Stack gap="xs">
                {requests.map(req => {
                    const itemName = equipments.find(e => e.id === req.equipmentId)?.name ?? "Unknown item";
                    const shopName = shops.find(s => s.id === req.shopId)?.name ?? "A shop";
                    const busy = busyId === req.id;

                    return (
                        <Card key={req.id} bg="rgba(0,0,0,0.3)" p="xs" style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6 }}>
                            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                                <div>
                                    <Text fw={700} size="sm">
                                        {req.isTrade
                                            ? `Trade: give ${describeTradeItems(req.giveItems) || "nothing"} · get ${describeTradeItems(req.wantItems) || "nothing"}`
                                            : `${req.isHaggle ? "Buying" : "Selling"} ${req.quantity}× ${itemName}`}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        {shopName} · your offer {coinText(req.offeredPriceGp, !!req.isTrade)} · their counter{" "}
                                        <b style={{ color: "var(--theme-color-accent-primary, #fbbf24)" }}>{coinText(req.counterPriceGp ?? 0, !!req.isTrade)}</b>
                                    </Text>
                                </div>
                                <Group gap="xs" wrap="nowrap">
                                    <button type="button" className="glass-btn-secondary" style={{ padding: "4px 10px", fontSize: "12px", cursor: "pointer" }} disabled={busy} onClick={() => onRespond(req.id!, false)}>
                                        Decline
                                    </button>
                                    <button type="button" className="glass-btn-primary" style={{ padding: "4px 10px", fontSize: "12px", cursor: "pointer" }} disabled={busy} onClick={() => onRespond(req.id!, true)}>
                                        Accept
                                    </button>
                                </Group>
                            </Group>
                        </Card>
                    );
                })}
            </Stack>
        </Card>
    );
}
