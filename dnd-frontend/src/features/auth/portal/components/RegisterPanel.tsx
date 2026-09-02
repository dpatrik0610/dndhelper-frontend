import { TextInput, Button, Group, Text, Stack, Title, Box } from "@mantine/core";
import { PasswordStrength } from "../../register/PasswordRequirement";

interface RegisterPanelProps {
  regUserVal: string;
  setRegUserVal: (val: string) => void;
  regPassVal: string;
  setRegPassVal: (val: string) => void;
  errors: { username?: string; password?: string };
  onSubmit: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterPanel({
  regUserVal,
  setRegUserVal,
  regPassVal,
  setRegPassVal,
  errors,
  onSubmit,
  onSwitchToLogin,
}: RegisterPanelProps) {
  return (
    <>
      <Title order={1} className="portal-header-title">
        Register
      </Title>
      <Text className="portal-header-subtitle">Create an Account</Text>

      <Stack gap="md">
        <TextInput
          label="Username"
          placeholder="Choose a username..."
          value={regUserVal}
          onChange={(e) => setRegUserVal(e.currentTarget.value)}
          required
          error={errors.username}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <PasswordStrength value={regPassVal} onChange={setRegPassVal} />

        {errors.password && (
          <Text color="red" size="sm" mt={4} style={{ fontFamily: "var(--font-sans)" }}>
            {errors.password}
          </Text>
        )}

        <Button
          fullWidth
          onClick={onSubmit}
          className="glass-btn-primary"
          mt={28}
          h={50}
          style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "15px" }}
        >
          Register
        </Button>

        <Group justify="center" mt="md">
          <Text size="sm" c="var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))" style={{ fontFamily: "var(--font-sans)" }}>
            Already have an account?{" "}
            <Text
              component="span"
              fw={700}
              c="var(--theme-color-accent-primary, #f59e0b)"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={onSwitchToLogin}
            >
              Login
            </Text>
          </Text>
        </Group>
      </Stack>
    </>
  );
}
