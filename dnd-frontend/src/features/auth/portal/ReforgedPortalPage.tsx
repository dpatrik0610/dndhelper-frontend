import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@store/ui/uiStore";
import { MagicThemeSelector } from "@components/common/MagicThemeSelector";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";

// Existing service and store dependencies
import { loginUser, registerUser } from "@services/authService";
import { processToken } from "@utils/processToken";
import { useLoadingNotification } from "@components/Notification/LoadingNotification";
import { useToken } from "@store/auth/authSelectors";
import AlreadyLoggedIn from "@features/auth/login/components/AlreadyLoggedIn";
import { validateRegisterForm } from "@validations/registerValidation";
import { showNotification } from "@components/Notification/Notification";

// Modularized form components
import { LoginPanel } from "./components/LoginPanel";
import { RegisterPanel } from "./components/RegisterPanel";

import "../styles/AuthCard.css";

interface ReforgedPortalPageProps {
  mode: "login" | "register";
}

export function ReforgedPortalPage({ mode }: ReforgedPortalPageProps) {
  const navigate = useNavigate();
  const token = useToken();

  const { sidebarTheme } = useUiStore();

  // Unified panel toggler state
  const [activePanel, setActivePanel] = useState<"login" | "register">(mode);

  // Prevents brief "already logged in" page flash before redirect navigates
  const [isRedirecting, setIsRedirecting] = useState(false);

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
      setIsRedirecting(true);
      processToken(response.token);

      // Fetch and apply user settings before closing notification and navigating
      await useUiStore.getState().fetchSettings();

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

      setIsRedirecting(true);
      processToken(response.token);
      toggleRegNotification(false, true);
      navigate("/");
    } catch (err: any) {
      toggleRegNotification(false, false, err.message || "Failed to register account");
    }
  };

  // Theme styling helpers
  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  if (token && !isRedirecting) {
    return (
      <Box className={`portal-container ${activeThemeClass} style-variant-glass`}>
        <Box className="portal-content-layer">
          <Box className="reforged-portal-card">
            <AlreadyLoggedIn />
          </Box>
        </Box>
        <MagicThemeSelector variant="floating" />
      </Box>
    );
  }

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
                <LoginPanel
                  loginUserVal={loginUserVal}
                  setLoginUserVal={setLoginUserVal}
                  loginPassVal={loginPassVal}
                  setLoginPasswordVal={setLoginPasswordVal}
                  onSubmit={handleLoginSubmit}
                  onSwitchToRegister={() => setActivePanel("register")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register-panel"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <RegisterPanel
                  regUserVal={regUserVal}
                  setRegUserVal={setRegUserVal}
                  regPassVal={regPassVal}
                  setRegPassVal={setRegPassVal}
                  errors={errors}
                  onSubmit={handleRegisterSubmit}
                  onSwitchToLogin={() => setActivePanel("login")}
                />
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
