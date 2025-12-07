import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      mih="100vh"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(120,120,255,0.08), transparent 35%)," +
          "radial-gradient(circle at 80% 30%, rgba(255,120,200,0.1), transparent 45%)," +
          "linear-gradient(180deg, rgba(12,12,20,0.9), rgba(8,8,16,0.9))",
      }}
    >
      <Stack
        align="center"
        gap="md"
        maw={520}
        p="lg" 
        style={{
          textAlign: "center",
          background: "rgba(255,255,255,0.02)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Text fw={800} fz={{ base: 64, sm: 96 }} c="grape.3" style={{ letterSpacing: 6 }}>
          404
        </Text>
        <Title order={2} c="white">
          Page not found
        </Title>
        <Text c="dimmed">
          The page you&apos;re looking for doesn&apos;t exist or was moved. Let&apos;s get you back on track.
        </Text>
        <Group justify="center" mt="sm">
          <Button
            variant="gradient"
            gradient={{ from: "violet", to: "cyan" }}
            onClick={() => navigate("/home")}
          >
            Go to Home
          </Button>
          <Button variant="outline" color="gray" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
