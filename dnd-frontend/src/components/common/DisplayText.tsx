import { Group, Text, Title } from "@mantine/core";

export interface DisplayTextProps {
    displayLabel: string;
    displayData: string | number | null | undefined;
    onClick?: () => void;
}

export default function DisplayText({ displayLabel, displayData, onClick }: DisplayTextProps) {
    return (
        <Group justify="space-between">
            <Title size="sm" c="dimmed">{displayLabel}</Title>
            <Text 
                size="sm" 
                onClick={onClick} 
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
                {displayData ?? '-'}
            </Text>
        </Group>
    );
}