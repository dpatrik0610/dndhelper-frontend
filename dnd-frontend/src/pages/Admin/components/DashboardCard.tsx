import { Card, Stack, Text, Group } from "@mantine/core";
import type { ReactNode } from "react";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}

export function DashboardCard({ icon, title, onClick }: DashboardCardProps) {
  return (
    <Card
      shadow="lg"
      radius="md"
      padding="xl"
      withBorder
      onClick={onClick}
      style={{
        cursor: "pointer",
        textAlign: "center",
        background: "linear-gradient(135deg, rgba(40, 10, 60, 0.6), rgba(20, 5, 40, 0.6))",
        border: "1px solid rgba(150, 80, 255, 0.4)",
        boxShadow: "0 0 8px rgba(100, 40, 200, 0.2)",
        transition: "all 0.2s ease-in-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(200, 100, 255, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 0 8px rgba(100, 40, 200, 0.2)";
      }}
    >
      <Stack align="center" justify="center" gap="sm">
        <Group
          align="center"
          justify="center"
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            width: "70px",
            height: "70px",
          }}
        >
          {icon}
        </Group>
        <Text fw={600} size="lg" c="grape.1">
          {title}
        </Text>
      </Stack>
    </Card>
  );
}
