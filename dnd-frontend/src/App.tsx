import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useMemo, lazy, Suspense } from "react";
import Sidebar from "@features/navigation/Sidebar/Sidebar";
import PrivateRoute from "@components/PrivateRoute";
import { useToken, useIsAdmin } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useTokenExpiryGuard } from "@features/auth/hooks/useTokenExpiryGuard";
import { useBootstrapCharacters } from "@features/profile/hooks/useBootstrapCharacters";
import { AppBackground } from "@components/layout/AppBackground";
import { SidebarToggle } from "@components/layout/SidebarToggle";
import { getAppShellStyles } from "@components/layout/appShellStyles";
import { SubtleRollDetailsModal } from "@components/roll/SubtleRollDetailsModal";
import { type SidebarThemeVariant, getActiveThemeClass } from "@appTypes/ThemeTypes";
import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "@hooks/useIsMobile";
import { PageSkeleton } from "@components/common/Skeletons";

// Route chunks: each import is shared by lazy() and the idle-time prefetch below.
const pages = {
  home: () => import("@features/home/Home"),
  profile: () => import("@features/profile/CharacterProfile"),
  spells: () => import("@features/spells/SpellPage"),
  characterForm: () => import("@features/characterForm/CharacterFormPage").then((m) => ({ default: m.CharacterFormPage })),
  notes: () => import("@features/notes/NotesPage"),
  quests: () => import("@features/quests/QuestsPage"),
  rollHistory: () => import("@features/rollHistory/RollHistoryPage"),
  rules: () => import("@features/rules/RulesPage"),
  encounterRoom: () => import("@features/encounterRoom/EncounterRoomPage"),
  shop: () => import("@features/shop/ShopkeeperPage"),
  settings: () => import("@features/settings/SettingsPage"),
};
const adminPage = () => import("@features/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }));

const Home = lazy(pages.home);
const CharacterProfile = lazy(pages.profile);
const SpellPage = lazy(pages.spells);
const CharacterFormPage = lazy(pages.characterForm);
const NotesPage = lazy(pages.notes);
const QuestsPage = lazy(pages.quests);
const RollHistoryPage = lazy(pages.rollHistory);
const RulesPage = lazy(pages.rules);
const EncounterRoomPage = lazy(pages.encounterRoom);
const ShopkeeperPage = lazy(pages.shop);
const SettingsPage = lazy(pages.settings);
const AdminDashboard = lazy(adminPage);
const Login = lazy(() => import("@features/auth/login/Login"));
const Register = lazy(() => import("@features/auth/register/Register"));
const NotFound = lazy(() => import("@features/notFound/NotFound"));

/** After login, fetch every page chunk while the browser is idle, so later navigation never waits on the network. */
function usePrefetchPages(enabled: boolean, includeAdmin: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const prefetch = () => {
      Object.values(pages).forEach((load) => void load().catch(() => {}));
      if (includeAdmin) void adminPage().catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 1500);
    return () => clearTimeout(id);
  }, [enabled, includeAdmin]);
}

function AppRoutes() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [opened, handlers] = useDisclosure(false);
  const sidebarTheme = useUiStore((s) => s.sidebarTheme) as SidebarThemeVariant;

  const hideSidebarRoutes = useMemo(() => ["/login", "/register"], []);
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  const token = useToken();
  const characters = useCharacterList();
  const isAdmin = useIsAdmin();

  const localToken = useMemo(() => {
    if (!token) return null;
    return localStorage.getItem("authToken");
  }, [token]);
  const activeToken = token ?? localToken ?? null;

  const fetchSettings = useUiStore((s) => s.fetchSettings);

  useTokenExpiryGuard(token, localToken);
  useBootstrapCharacters(activeToken, characters.length);
  usePrefetchPages(!!activeToken, isAdmin);

  // Top-level section ("spells" for /spells/Fireball). Changing it replays the page enter animation
  // and scrolls to top; moving within a section (e.g. between spells) does neither.
  const section = location.pathname.split("/")[1] || "home";
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [section]);

  useEffect(() => {
    if (activeToken) {
      void fetchSettings();
    }
  }, [activeToken, fetchSettings]);

  useEffect(() => {
    if (opened && location.pathname === "/login") handlers.close();
  }, [location.pathname, opened, handlers]);

  // Swipe gesture support for mobile sidebar
  useEffect(() => {
    if (!isMobile || !showSidebar) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();

      const diffX = endX - startX;
      const diffY = endY - startY;
      const timeDiff = endTime - startTime;

      const minSwipeDistance = 50;
      const maxVerticalDeviation = 40;
      const maxTime = 350;

      if (timeDiff <= maxTime && Math.abs(diffY) < maxVerticalDeviation) {
        // Swipe Left (Right-to-Left) -> Open
        if (diffX <= -minSwipeDistance) {
          const isNearRightEdge = startX > window.innerWidth - 60;
          if (!opened && isNearRightEdge) {
            handlers.open();
          }
        }
        // Swipe Right (Left-to-Right) -> Close
        else if (diffX >= minSwipeDistance) {
          if (opened) {
            handlers.close();
          }
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, showSidebar, opened, handlers]);

  const togglePosition = useMemo(
    () => (isMobile ? { bottom: 20, right: 16 } : { bottom: 12, right: 12 }),
    [isMobile]
  );

  const isDashboardRoute = location.pathname === "/dashboard";

  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  // Mantine portals (dropdowns, modals, popovers) render on <body>, outside AppShell,
  // so the theme class must also sit on <html> for them to get the theme variables.
  useEffect(() => {
    if (isDashboardRoute) return;
    const root = document.documentElement;
    root.classList.add(activeThemeClass);
    return () => root.classList.remove(activeThemeClass);
  }, [activeThemeClass, isDashboardRoute]);

  return (
    <AppShell 
      header={{ height: 0 }} 
      styles={getAppShellStyles(isMobile, isDashboardRoute)} 
      className={isDashboardRoute ? "" : `${activeThemeClass} style-variant-glass`}
    >
      {showSidebar && <Sidebar opened={opened} onClose={handlers.close} position="right" themeVariant={sidebarTheme} />}

      <AppShell.Main>
        <AppBackground />
        <SubtleRollDetailsModal />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: isDashboardRoute ? 0 : (isMobile ? 0 : "md"),
          }}
        >
          <Suspense fallback={<div className="route-fallback"><PageSkeleton /></div>}>
            <div key={section} className="route-enter">
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
                <Route path="/shop" element={<ShopkeeperPage />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/quests" element={<QuestsPage />} />
                <Route path="/encounter" element={<Navigate to="/encounter-room" replace />} />
                <Route path="/encounter-room" element={<EncounterRoomPage />} />
                <Route path="/encounter-room/:roomId" element={<EncounterRoomPage />} />
                <Route path="/roll-history" element={<RollHistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {isAdmin && <Route path="/dashboard" element={<AdminDashboard />} />}
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
          </Suspense>
        </div>
      </AppShell.Main>

      {showSidebar && !isMobile && (
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