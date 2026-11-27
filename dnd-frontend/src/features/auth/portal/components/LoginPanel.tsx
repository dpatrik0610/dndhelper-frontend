import { TextInput, PasswordInput, Button, Text, Stack, Title } from "@mantine/core";
import { Link } from "react-router";

interface LoginPanelProps {
  loginUserVal: string;
  setLoginUserVal: (val: string) => void;
  loginPassVal: string;
  setLoginPasswordVal: (val: string) => void;
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
}

export function LoginPanel({
  loginUserVal,
  setLoginUserVal,
  loginPassVal,
  setLoginPasswordVal,
  onSubmit,
  busy,
  error,
}: LoginPanelProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Title order={1} className="portal-header-title">
        D&D Reforged
      </Title>
      <Text className="portal-header-subtitle">Log in</Text>

      <Stack gap="lg">
        <TextInput
          label="Username"
          name="username"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          value={loginUserVal}
          onChange={(e) => setLoginUserVal(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          value={loginPassVal}
          onChange={(e) => setLoginPasswordVal(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        {error && (
          <p className="portal-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={busy} className="glass-btn-primary" mt={24} h={50}>
          Log in
        </Button>

        <p className="portal-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </Stack>
    </form>
  );
}
