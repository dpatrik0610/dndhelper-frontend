import { TextInput, Button, Text, Stack, Title } from "@mantine/core";
import { Link } from "react-router";
import { PasswordStrength } from "@features/auth/register/PasswordRequirement";

interface RegisterPanelProps {
  regUserVal: string;
  setRegUserVal: (val: string) => void;
  regPassVal: string;
  setRegPassVal: (val: string) => void;
  errors: { username?: string; password?: string };
  onSubmit: () => void;
  busy: boolean;
  error: string | null;
}

export function RegisterPanel({
  regUserVal,
  setRegUserVal,
  regPassVal,
  setRegPassVal,
  errors,
  onSubmit,
  busy,
  error,
}: RegisterPanelProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Title order={1} className="portal-header-title">
        Register
      </Title>
      <Text className="portal-header-subtitle">Create an account</Text>

      <Stack gap="md">
        <TextInput
          label="Username"
          name="username"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          value={regUserVal}
          onChange={(e) => setRegUserVal(e.currentTarget.value)}
          required
          error={errors.username}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <PasswordStrength value={regPassVal} onChange={setRegPassVal} />

        {(errors.password || error) && (
          <p className="portal-error" role="alert">
            {errors.password ?? error}
          </p>
        )}

        <Button type="submit" fullWidth loading={busy} className="glass-btn-primary" mt={28} h={50}>
          Create account
        </Button>

        <p className="portal-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Stack>
    </form>
  );
}
