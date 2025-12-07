import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo } from "react";
import Sidebar from "@features/navigation/Sidebar/Sidebar";
import Home from "@features/home/Home";
import Login from "@features/auth/login/Login";
import Register from "@features/auth/register/Register";
import NotFound from "@features/notFound/NotFound";
import CharacterProfile from "@features/profile/CharacterProfile";
import SpellPage from "@features/spells/SpellPage";
import { CharacterFormPage } from "@features/characterForm/CharacterFormPage";
import { AdminDashboard } from "@features/admin/AdminDashboard";
import NotesPage from "@features/notes/NotesPage";
import PrivateRoute from "@components/PrivateRoute";
import { useAuthStore } from "@store/useAuthStore";
import { useCharacterStore } from "@store/useCharacterStore";
import { useTokenExpiryGuard } from "@features/auth/hooks/useTokenExpiryGuard";
import { useBootstrapCharacters } from "@features/profile/hooks/useBootstrapCharacters";
import { AppBackground } from "@components/layout/AppBackground";
import { SidebarToggle } from "@components/layout/SidebarToggle";
import { getAppShellStyles } from "@components/layout/appShellStyles";
import SettingsPage from "@features/settings/SettingsPage";
import { type SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";
import { useUiStore } from "@store/useUiStore";

function AppRoutes() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, handlers] = useDisclosure(false);
  const sidebarTheme = useUiStore((s) => s.sidebarTheme) as SidebarThemeVariant;

  const token = useAuthStore((s) => s.token);
  const roles = useAuthStore((s) => s.roles);
  const { characters } = useCharacterStore();
  const isAdmin = roles.includes("Admin");

  const localToken = useMemo(() => localStorage.getItem("authToken"), []);
  const activeToken = token ?? localToken ?? null;

  useTokenExpiryGuard(token, localToken);
  useBootstrapCharacters(activeToken, characters.length);

  useEffect(() => {
    if (opened && location.pathname === "/login") handlers.close();
  }, [location.pathname, opened, handlers]);

  const hideSidebarRoutes = ["/login", "/register"];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);
  const togglePosition = useMemo(
    () => (isMobile ? { bottom: 20, right: 16 } : { bottom: 12, right: 12 }),
    [isMobile]
  );

  return (
    <AppShell header={{ height: 0 }} styles={getAppShellStyles(isMobile)} >
      {showSidebar && <Sidebar opened={opened} onClose={handlers.close} position="right" themeVariant={sidebarTheme} />}

      <AppShell.Main>
        <AppBackground />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? 0 : "md",
          }}
        >
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<CharacterProfile />} />
              <Route path="/spells" element={<SpellPage />} />
              <Route path="/spells/:spellName" element={<SpellPage />} />
              <Route path="/newCharacter" element={<CharacterFormPage />} />
              <Route path="/editCharacter" element={<CharacterFormPage editMode />} />
              <Route path="/notes" element={<NotesPage />} />
              {isAdmin && <Route path="/settings" element={<SettingsPage />} />}
              {isAdmin && <Route path="/dashboard" element={<AdminDashboard />} />}
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AppShell.Main>

      {showSidebar && (
        <SidebarToggle
          opened={opened}
          onToggle={handlers.toggle}
          isMobile={isMobile}
          affixPosition={togglePosition}
        />
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
