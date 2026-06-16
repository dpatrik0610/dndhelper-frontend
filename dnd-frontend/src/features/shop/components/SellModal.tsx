import { Modal, Stack, Text, Divider, NumberInput, SimpleGrid, Button } from "@mantine/core";
import type { Inventory } from "@appTypes/Inventory/Inventory";

interface SellModalProps {
    opened: boolean;
    onClose: () => void;
    selectedEquipmentId: string | null;
    equipments: any[];
    playerInventory: Inventory | null | undefined;
    sellQuantity: number;
    setSellQuantity: (val: number) => void;
    askedGp: number;
    setAskedGp: (val: number) => void;
    askedSp: number;
    setAskedSp: (val: number) => void;
    executeSell: () => void;
    actionLoading: boolean;
}

export function SellModal({
    opened,
    onClose,
    selectedEquipmentId,
    equipments,
    playerInventory,
    sellQuantity,
    setSellQuantity,
    askedGp,
    setAskedGp,
    askedSp,
    setAskedSp,
    executeSell,
    actionLoading,
}: SellModalProps) {
    if (!selectedEquipmentId) return null;

    const eq = equipments.find(e => e.id === selectedEquipmentId);
    const maxQty = playerInventory?.items?.find(i => i.equipmentId === selectedEquipmentId)?.quantity ?? 1;

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title="Offer Item for Sale" 
            centered
            styles={{
                content: {
                    background: "rgba(22, 19, 17, 0.92)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.7)",
                    color: "white"
                },
                header: {
                    background: "transparent",
                    color: "white"
                },
                title: {
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "white"
                },
                close: {
                    color: "rgba(255, 255, 255, 0.5)",
                    "&:hover": {
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.05)"
                    }
                }
            }}
        >
            <Stack gap="md">
                <Text fw={700} c="white" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {eq?.name}
                </Text>
                <Text size="sm" c="gray.4">
                    The item will be removed from your bag and placed in escrow until the DM approves or rejects the sale.
                </Text>
                <Text size="xs" c="dimmed">
                    Max available to sell: {maxQty}
                </Text>

                <Divider color="rgba(245, 158, 11, 0.15)" />

                <NumberInput 
                    label="Quantity to Sell" 
                    value={sellQuantity} 
                    onChange={(v) => setSellQuantity(Number(v))} 
                    min={1} 
                    max={maxQty}
                    styles={{
                        input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                    }}
                />

                <SimpleGrid cols={2} spacing="xs">
                    <NumberInput 
                        label="Asked Gold (gp)" 
                        value={askedGp} 
                        onChange={(v) => setAskedGp(Number(v))} 
                        min={0}
                        styles={{
                            input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                        }}
                    />
                    <NumberInput 
                        label="Asked Silver (sp)" 
                        value={askedSp} 
                        onChange={(v) => setAskedSp(Number(v))} 
                        min={0}
                        max={99}
                        styles={{
                            input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                        }}
                    />
                </SimpleGrid>

                <Button color="orange" onClick={executeSell} loading={actionLoading} mt="sm" styles={{ root: { backgroundColor: "#ea580c", color: "white", fontWeight: 700, "&:hover": { backgroundColor: "#c2410c" } } }}>
                    Submit Offer
                </Button>
            </Stack>
       </Modal>
    );
}
