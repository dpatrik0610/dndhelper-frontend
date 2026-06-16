import { Modal, Stack, Text, NumberInput, Button } from "@mantine/core";

interface BuyModalProps {
    opened: boolean;
    onClose: () => void;
    buyQuantity: number;
    setBuyQuantity: (val: number) => void;
    executeBuy: () => void;
    actionLoading: boolean;
}

export function BuyModal({
    opened,
    onClose,
    buyQuantity,
    setBuyQuantity,
    executeBuy,
    actionLoading,
}: BuyModalProps) {
    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            title="Purchase Item" 
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
                 <Text size="sm" c="gray.4">How many would you like to buy?</Text>
                 <NumberInput 
                     value={buyQuantity} 
                     onChange={(v) => setBuyQuantity(Number(v))} 
                     min={1} 
                     styles={{
                         input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                     }}
                 />
                 <Button color="yellow" onClick={executeBuy} loading={actionLoading} styles={{ root: { backgroundColor: "#fbbf24", color: "#1e1b18", fontWeight: 700, "&:hover": { backgroundColor: "#f59e0b" } } }}>
                     Confirm Purchase
                 </Button>
             </Stack>
        </Modal>
    );
}
