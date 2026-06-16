import { Modal, Stack, Text, NumberInput, Button } from "@mantine/core";
import type { Inventory } from "@appTypes/Inventory/Inventory";

interface StealModalProps {
    opened: boolean;
    onClose: () => void;
    selectedEquipmentId: string | null;
    equipments: any[];
    shopInventory: Inventory | null | undefined;
    stealQuantity: number;
    setStealQuantity: (val: number) => void;
    executeSteal: () => void;
    actionLoading: boolean;
}

export function StealModal({
    opened,
    onClose,
    selectedEquipmentId,
    equipments,
    shopInventory,
    stealQuantity,
    setStealQuantity,
    executeSteal,
    actionLoading,
}: StealModalProps) {
    if (!selectedEquipmentId) return null;

    const eq = equipments.find(e => e.id === selectedEquipmentId);
    const maxQty = shopInventory?.items?.find(i => i.equipmentId === selectedEquipmentId)?.quantity ?? 1;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Are you REALLY SURE?"
            centered
            styles={{
                content: {
                    background: "rgba(24, 15, 15, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
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
                    color: "#f87171"
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
                <Text size="sm" c="gray.3">
                    Are you REALLY SURE you want to attempt to steal 
                </Text>
                <Text fw={700} c="white" style={{ textTransform: "uppercase", letterSpacing: 1 }} >
                    {eq?.name} ?
                </Text>
                <Text size="xs" c="dimmed">
                    Max available to steal: {maxQty}
                </Text>
                <NumberInput
                    label="Quantity to Steal"
                    value={stealQuantity}
                    onChange={(v) => setStealQuantity(Number(v))}
                    min={1}
                    max={maxQty}
                    styles={{
                        input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(239, 68, 68, 0.1)" }
                    }}
                />
                <Button 
                    color="red" 
                    onClick={executeSteal} 
                    loading={actionLoading} 
                    mt="sm" 
                    styles={{ 
                        root: { 
                            backgroundColor: "#ef4444", 
                            color: "white", 
                            fontWeight: 700, 
                            "&:hover": { backgroundColor: "#dc2626" } 
                        } 
                    }}
                >
                    Attempt Steal
                </Button>
            </Stack>
        </Modal>
    );
}
