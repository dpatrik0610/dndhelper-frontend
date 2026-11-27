import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Box } from "@mantine/core";
import { motion } from "motion/react";
import { useUiStore } from "@store/ui/uiStore";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";

import { loginUser, registerUser } from "@services/authService";
import { processToken } from "@utils/processToken";
import { useToken } from "@store/auth/authSelectors";
import AlreadyLoggedIn from "@features/auth/login/components/AlreadyLoggedIn";
import { validateRegisterForm } from "@validations/registerValidation";

import { LoginPanel } from "./components/LoginPanel";
import { RegisterPanel } from "./components/RegisterPanel";

import "@features/auth/styles/AuthCard.css";

interface ReforgedPortalPageProps {
  mode: "login" | "register";
}

export function ReforgedPortalPage({ mode }: ReforgedPortalPageProps) {
  const navigate = useNavigate();
  const token = useToken();

  const { sidebarTheme } = useUiStore();

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [loginUserVal, setLoginUserVal] = useState("");
  const [loginPassVal, setLoginPasswordVal] = useState("");

  const [regUserVal, setRegUserVal] = useState("");
  const [regPassVal, setRegPassVal] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleLoginSubmit = async () => {
    if (busy) return;
    const username = loginUserVal.trim();
    if (!username || !loginPassVal) {
      setFormError("Enter your username and password.");
      return;
    }

    setFormError(null);
    setBusy(true);
    try {
      const response = await loginUser({ username, password: loginPassVal });
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("username", username);
      setIsRedirecting(true);
      processToken(response.token);
      await useUiStore.getState().fetchSettings();
      navigate("/");
    } catch {
      setFormError("Wrong username or password. Check both and try again.");
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (busy) return;
    const { valid, errors: validationErrors } = validateRegisterForm(regUserVal, regPassVal);
    setErrors(validationErrors);
    setFormError(null);
    if (!valid) return;

    setBusy(true);
    try {
      const response = await registerUser({ username: regUserVal.trim(), password: regPassVal });
      if (!response?.token) throw new Error("The server didn't return a session. Try logging in.");
      setIsRedirecting(true);
      processToken(response.token);
      navigate("/");
    } catch (err) {
      setFormError(err instanceof Error && err.message ? err.message : "Couldn't create the account. Try another username.");
      setBusy(false);
    }
  };

  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  if (token && !isRedirecting) {
    return (
      <Box className={`portal-container ${activeThemeClass} style-variant-glass`}>
        <Box className="portal-content-layer">
          <Box className="reforged-portal-card">
            <AlreadyLoggedIn />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={`portal-container ${activeThemeClass} style-variant-glass`}>
      <Box className="portal-content-layer">
        <Box className="reforged-portal-card">
          <motion.div
            initial={{ opacity: 0, x: mode === "login" ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {mode === "login" ? (
              <LoginPanel
                loginUserVal={loginUserVal}
                setLoginUserVal={setLoginUserVal}
                loginPassVal={loginPassVal}
                setLoginPasswordVal={setLoginPasswordVal}
                onSubmit={handleLoginSubmit}
                busy={busy}
                error={formError}
              />
            ) : (
              <RegisterPanel
                regUserVal={regUserVal}
                setRegUserVal={setRegUserVal}
                regPassVal={regPassVal}
                setRegPassVal={setRegPassVal}
                errors={errors}
                onSubmit={handleRegisterSubmit}
                busy={busy}
                error={formError}
              />
            )}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
