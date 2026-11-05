import { useEffect, useState } from "react";
import { Stack, Text, NumberInput, SimpleGrid } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { convertCostToSilver, formatSilverToDisplay } from "@utils/currencyConverter";

interface HaggleModalProps {
    opened: boolean;
    onClose: () => void;
    selectedEquipmentId: string | null;
    equipments: Equipment[];
    shopInventory: Inventory | null | undefined;
    priceMultiplier: number;
    executeHaggle: (quantity: number, offeredPriceGp: number) => void;
    actionLoading: boolean;
}

export function HaggleModal({
    opened,
    onClose,
    selectedEquipmentId,
    equipments,
    shopInventory,
    priceMultiplier,
    executeHaggle,
    actionLoading,
}: HaggleModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [offerGp, setOfferGp] = useState(0);
    const [offerSp, setOfferSp] = useState(0);

    useEffect(() => {
        if (opened) {
            setQuantity(1);
            setOfferGp(0);
            setOfferSp(0);
        }
    }, [opened, selectedEquipmentId]);

    if (!selectedEquipmentId) return null;

    const eq = equipments.find(e => e.id === selectedEquipmentId);
    const stock = shopInventory?.items?.find(i => i.equipmentId === selectedEquipmentId)?.quantity;
    const askingSp = Math.round(convertCostToSilver(eq?.cost) * priceMultiplier) * quantity;
    const offerTotalSp = offerGp * 100 + offerSp;
    const discount = askingSp > 0 ? Math.round((1 - offerTotalSp / askingSp) * 100) : 0;

    return (
        <BaseModal
            opened={opened}
            onClose={onClose}
            title="Haggle"
            size="sm"
            loading={actionLoading}
            onSave={() => executeHaggle(quantity, offerTotalSp / 100)}
            saveLabel="Make Offer"
        >
            <Stack gap="md">
                <Text fw={700} style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {eq?.name}
                </Text>
                <Text size="sm" c="dimmed">
                    Name your price. The shopkeeper (your DM) will accept or refuse the offer. Coin only leaves your purse if they accept.
                </Text>

                <NumberInput
                    label="Quantity"
                    value={quantity}
                    onChange={(v) => setQuantity(Math.max(1, Number(v) || 1))}
                    min={1}
                    max={stock ?? undefined}
                />

                <SimpleGrid cols={2} spacing="xs">
                    <NumberInput label="Offer (gp)" value={offerGp} onChange={(v) => setOfferGp(Number(v) || 0)} min={0} />
                    <NumberInput label="Offer (sp)" value={offerSp} onChange={(v) => setOfferSp(Number(v) || 0)} min={0} max={99} />
                </SimpleGrid>

                <Text size="xs" c="dimmed">
                    Asking price: <b>{formatSilverToDisplay(askingSp)}</b>
                    {offerTotalSp > 0 && discount !== 0 && ` · your offer is ${Math.abs(discount)}% ${discount > 0 ? "below" : "above"} asking`}
                </Text>
            </Stack>
        </BaseModal>
    );
}
