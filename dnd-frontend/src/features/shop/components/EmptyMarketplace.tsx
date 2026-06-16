import { Center, Stack, ThemeIcon, Text } from "@mantine/core";
import { IconBuildingStore } from "@tabler/icons-react";

export function EmptyMarketplace() {
    return (
        <Center style={{ minHeight: "60vh" }}>
            <Stack align="center" gap="sm" style={{ maxWidth: 360, textAlign: "center" }}>
                <ThemeIcon size="xl" variant="light" color="orange" radius="xl" style={{ border: "1px solid rgba(234, 88, 12, 0.2)" }}>
                    <IconBuildingStore size={26} />
                </ThemeIcon>
                <Text fw={700} size="md" c="white" style={{ textTransform: "uppercase", letterSpacing: 1 }}>The Marketplace is Quiet</Text>
                <Text size="xs" c="dimmed">
                    There are no open shops in this campaign at the moment. Trade stalls will appear here once DMs open them.
                </Text>
            </Stack>
        </Center>
    );
}
