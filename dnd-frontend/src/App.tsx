import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell, Loader, Center } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, lazy, Suspense } from "react";
import Sidebar from "@features/navigation/Sidebar/Sidebar";
import PrivateRoute from "@components/PrivateRoute";
import { useToken, useRoles } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useTokenExpiryGuard } from "@features/auth/hooks/useTokenExpiryGuard";
import { useBootstrapCharacters } from "@features/profile/hooks/useBootstrapCharacters";
import { AppBackground } from "@components/layout/AppBackground";
import { SidebarToggle } from "@components/layout/SidebarToggle";
import { getAppShellStyles } from "@components/layout/appShellStyles";
import { SubtleRollDetailsModal } from "@components/roll/SubtleRollDetailsModal";
import { type SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";
import { useUiStore } from "@store/ui/uiStore";

// Lazy load route components for code splitting
const Home = lazy(() => import("@features/home/Home"));
const Login = lazy(() => import("@features/auth/login/Login"));
const Register = lazy(() => import("@features/auth/register/Register"));
const NotFound = lazy(() => import("@features/notFound/NotFound"));
const CharacterProfile = lazy(() => import("@features/profile/CharacterProfile"));
const SpellPage = lazy(() => import("@features/spells/SpellPage"));
const CharacterFormPage = lazy(() => import("@features/characterForm/CharacterFormPage").then(m => ({ default: m.CharacterFormPage })));
const AdminDashboard = lazy(() => import("@features/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const NotesPage = lazy(() => import("@features/notes/NotesPage"));
const RollHistoryPage = lazy(() => import("@features/rollHistory/RollHistoryPage"));
const RulesPage = lazy(() => import("@features/rules/RulesPage"));
const AiAssistantPage = lazy(() => import("@features/aiAssistant/AiAssistantPage"));
const EncounterRoomPage = lazy(() => import("@features/encounterRoom/EncounterRoomPage"));

function AppRoutes() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [opened, handlers] = useDisclosure(false);
  const sidebarTheme = useUiStore((s) => s.sidebarTheme) as SidebarThemeVariant;

  const token = useToken();
  const roles = useRoles();
  const characters = useCharacterList();
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
        <SubtleRollDetailsModal />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? 0 : "md",
          }}
        >
          <Suspense fallback={<Center mt="20vh"><Loader color="indigo" /></Center>}>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/profile" element={<CharacterProfile />} />
                <Route path="/spells" element={<SpellPage />} />
                <Route path="/spells/:spellName" element={<SpellPage />} />
                <Route path="/newCharacter" element={<CharacterFormPage />} />
                <Route path="/editCharacter" element={<CharacterFormPage editMode />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/encounter" element={<Navigate to="/encounter-room" replace />} />
                <Route path="/encounter-room" element={<EncounterRoomPage />} />
                <Route path="/encounter-room/:roomId" element={<EncounterRoomPage />} />
                <Route path="/roll-history" element={<RollHistoryPage />} />
                {isAdmin && <Route path="/dashboard" element={<AdminDashboard />} />}
                {isAdmin && <Route path="/ai-assistant" element={<AiAssistantPage />} />}
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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