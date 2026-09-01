import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Group,
  Stack,
  Text,
  Title,
  Button,
  TextInput,
  PasswordInput,
  Tooltip,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@hooks/useIsMobile";
import { useUiStore } from "@store/ui/uiStore";
import { MagicThemeSelector } from "@components/common/MagicThemeSelector";

// Existing service and store dependencies
import { loginUser, registerUser } from "@services/authService";
import { processToken } from "@utils/processToken";
import { useLoadingNotification } from "@components/Notification/LoadingNotification";
import { useToken } from "@store/auth/authSelectors";
import AlreadyLoggedIn from "@features/auth/login/components/AlreadyLoggedIn";
import { validateRegisterForm } from "@validations/registerValidation";
import { showNotification } from "@components/Notification/Notification";
import { PasswordStrength } from "../register/PasswordRequirement";

import "../styles/AuthCard.css";

interface ReforgedPortalPageProps {
  mode: "login" | "register";
}

export function ReforgedPortalPage({ mode }: ReforgedPortalPageProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const token = useToken();

  const { sidebarTheme, setSidebarTheme } = useUiStore();

  // Unified panel toggler state
  const [activePanel, setActivePanel] = useState<"login" | "register">(mode);

  // Sync state if routing changes
  useEffect(() => {
    setActivePanel(mode);
  }, [mode]);

  // Form Field States
  const [loginUserVal, setLoginUserVal] = useState("");
  const [loginPassVal, setLoginPasswordVal] = useState("");

  const [regUserVal, setRegUserVal] = useState("");
  const [regPassVal, setRegPassVal] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Loading Notification Helpers
  const toggleLoginNotification = useLoadingNotification({
    title: "Logging in...",
    message: "Please wait while we establish your session",
    successTitle: "Login Successful",
    successMessage: `Welcome back, ${loginUserVal}!`,
    errorTitle: "Login Failed",
    errorMessage: "Check your username and password",
    autoClose: 2000,
  });

  const toggleRegNotification = useLoadingNotification({
    id: "portal-registration",
    title: "Creating account...",
    message: "Registering credentials on server registry",
    successTitle: "Registration Successful",
    successMessage: `Account created successfully! Welcome, ${regUserVal}!`,
    errorTitle: "Registration Failed",
    errorMessage: "Check your details or select another username",
    autoClose: 2000,
  });

  // Handle Login submission
  const handleLoginSubmit = async () => {
    if (!loginUserVal.trim() || !loginPassVal.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Please enter both username and password.",
        color: "red",
      });
      return;
    }

    toggleLoginNotification(true);
    try {
      const response = await loginUser({
        username: loginUserVal.trim(),
        password: loginPassVal.trim(),
      });
      await new Promise((res) => setTimeout(res, 800));

      localStorage.setItem("authToken", response.token);
      localStorage.setItem("username", loginUserVal.trim());
      processToken(response.token);

      toggleLoginNotification(false, true);
      navigate("/");
    } catch {
      toggleLoginNotification(false, false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async () => {
    const { valid, errors: validationErrors } = validateRegisterForm(regUserVal, regPassVal);
    setErrors(validationErrors);

    if (!valid) {
      showNotification({
        title: "Validation Error",
        message: Object.values(validationErrors).join(" | "),
        color: "red",
      });
      return;
    }

    toggleRegNotification(true);
    try {
      const response = await registerUser({
        username: regUserVal.trim(),
        password: regPassVal.trim(),
      });
      if (!response?.token) throw new Error("No token returned");

      processToken(response.token);
      toggleRegNotification(false, true);
      navigate("/");
    } catch (err: any) {
      toggleRegNotification(false, false, err.message || "Failed to register account");
    }
  };

  if (token) {
    return <AlreadyLoggedIn />;
  }

  // Theme styling helpers
  const activeThemeClass = useMemo(() => {
    switch (sidebarTheme) {
      case "midnight":
        return "theme-midnight-arcane";
      case "crimson-vampire":
        return "theme-crimson-vampire";
      case "frost-glacier":
        return "theme-frost-glacier";
      case "sunset":
      default:
        return "theme-cyber-noir";
    }
  }, [sidebarTheme]);

  // Unified Label styles
  const inputLabelStyle = {
    fontFamily: "var(--font-sans)",
    fontWeight: 500,
    letterSpacing: "0.5px",
    fontSize: "13px",
    color: "var(--theme-color-text-primary, #ffffff)",
    marginBottom: "6px",
  };

  return (
    <Box className={`portal-container ${activeThemeClass} style-variant-glass`}>
      {/* 1. CENTRAL USER PORTAL CARDS (WITH SEAMLESS SLIDE TRANSITION) */}
      <Box className="portal-content-layer">
        <Box className="reforged-portal-card">
          <AnimatePresence mode="wait">
            {activePanel === "login" ? (
              <motion.div
                key="login-panel"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {/* LOGIN PANEL VIEW */}
                <Title order={1} className="portal-header-title">
                  D&D Reforged
                </Title>
                <Text className="portal-header-subtitle">
                  Login
                </Text>

                <Stack gap="md">
                  <TextInput
                    label="Username"
                    placeholder="Enter your username..."
                    value={loginUserVal}
                    onChange={(e) => setLoginUserVal(e.currentTarget.value)}
                    required
                    classNames={{ input: "portal-glassy-input", label: "glassy-label" }}
                    styles={{
                      label: inputLabelStyle,
                      input: {
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        height: "44px",
                      },
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleLoginSubmit();
                    }}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password..."
                    value={loginPassVal}
                    onChange={(e) => setLoginPasswordVal(e.currentTarget.value)}
                    required
                    classNames={{ input: "portal-glassy-input", label: "glassy-label" }}
                    styles={{
                      label: inputLabelStyle,
                      input: {
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        height: "44px",
                      },
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleLoginSubmit();
                    }}
                  />

                  <Button
                    fullWidth
                    onClick={handleLoginSubmit}
                    variant="gradient"
                    gradient={{ from: "var(--theme-color-accent-primary, #f59e0b)", to: "var(--theme-border-glow, #3b82f6)", deg: 135 }}
                    style={{
                      marginTop: "16px",
                      height: "46px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontSize: "14px",
                      fontFamily: "var(--font-sans)",
                      boxShadow: "var(--theme-glow-shadow-primary)",
                      borderRadius: "8px",
                    }}
                  >
                    Login
                  </Button>

                  <Group justify="center" mt="md">
                    <Text size="sm" style={{ fontFamily: "var(--font-sans)", color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))" }}>
                      Don't have an account?{" "}
                      <Text
                        component="span"
                        fw={700}
                        style={{
                          color: "var(--theme-color-accent-primary)",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => setActivePanel("register")}
                      >
                        Register
                      </Text>
                    </Text>
                  </Group>
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                key="register-panel"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                {/* REGISTRATION PANEL VIEW */}
                <Title order={1} className="portal-header-title">
                  Register
                </Title>
                <Text className="portal-header-subtitle">
                  Create an Account
                </Text>

                <Stack gap="sm">
                  <TextInput
                    label="Username"
                    placeholder="Choose a username..."
                    value={regUserVal}
                    onChange={(e) => setRegUserVal(e.currentTarget.value)}
                    required
                    error={errors.username}
                    classNames={{ input: "portal-glassy-input", label: "glassy-label" }}
                    styles={{
                      label: inputLabelStyle,
                      input: {
                        fontFamily: "var(--font-sans)",
                        fontSize: "14px",
                        height: "44px",
                      },
                    }}
                  />

                  <Box>
                    <Text style={inputLabelStyle}>
                      Password Strength
                    </Text>
                    <PasswordStrength value={regPassVal} onChange={setRegPassVal} />
                  </Box>

                  {errors.password && (
                    <Text color="red" size="sm" mt={4} style={{ fontFamily: "var(--font-sans)" }}>
                      {errors.password}
                    </Text>
                  )}

                  <Button
                    fullWidth
                    onClick={handleRegisterSubmit}
                    variant="gradient"
                    gradient={{ from: "var(--theme-color-accent-primary, #f59e0b)", to: "var(--theme-border-glow, #3b82f6)", deg: 135 }}
                    style={{
                      marginTop: "20px",
                      height: "46px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      fontSize: "14px",
                      fontFamily: "var(--font-sans)",
                      boxShadow: "var(--theme-glow-shadow-primary)",
                      borderRadius: "8px",
                    }}
                  >
                    Register
                  </Button>

                  <Group justify="center" mt="md">
                    <Text size="sm" style={{ fontFamily: "var(--font-sans)", color: "var(--theme-color-text-secondary, rgba(255,255,255,0.7))" }}>
                      Already have an account?{" "}
                      <Text
                        component="span"
                        fw={700}
                        style={{
                          color: "var(--theme-color-accent-primary)",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => setActivePanel("login")}
                      >
                        Login
                      </Text>
                    </Text>
                  </Group>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* 3. RUNES OF POWER THEME SWITCHER BAR (BOTTOM CENTER) */}
      <MagicThemeSelector variant="floating" />
    </Box>
  );
}
