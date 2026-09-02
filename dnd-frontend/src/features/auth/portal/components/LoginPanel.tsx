import { TextInput, PasswordInput, Button, Group, Text, Stack, Title } from "@mantine/core";

interface LoginPanelProps {
  loginUserVal: string;
  setLoginUserVal: (val: string) => void;
  loginPassVal: string;
  setLoginPasswordVal: (val: string) => void;
  onSubmit: () => void;
  onSwitchToRegister: () => void;
}

export function LoginPanel({
  loginUserVal,
  setLoginUserVal,
  loginPassVal,
  setLoginPasswordVal,
  onSubmit,
  onSwitchToRegister,
}: LoginPanelProps) {
  return (
    <>
      <Title order={1} className="portal-header-title">
        D&D Reforged
      </Title>
      <Text className="portal-header-subtitle">Login</Text>

      <Stack gap="lg">
        <TextInput
          label="Username"
          placeholder="Enter your username..."
          value={loginUserVal}
          onChange={(e) => setLoginUserVal(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void onSubmit();
          }}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password..."
          value={loginPassVal}
          onChange={(e) => setLoginPasswordVal(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void onSubmit();
          }}
        />

        <Button
          fullWidth
          onClick={onSubmit}
          className="glass-btn-primary"
          mt={24}
          h={50}
          style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "15px" }}
        >
          Login
        </Button>

        <Group justify="center" mt="md">
          <Text size="sm" c="var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))" style={{ fontFamily: "var(--font-sans)" }}>
            Don't have an account?{" "}
            <Text
              component="span"
              fw={700}
              c="var(--theme-color-accent-primary, #f59e0b)"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={onSwitchToRegister}
            >
              Register
            </Text>
          </Text>
        </Group>
      </Stack>
    </>
  );
}
