import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AppShell, ActionIcon } from "@mantine/core";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useAuthStore } from "./store/useAuthStore";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import NotFound from "./pages/NotFound/NotFound";
import CharacterProfile from "./pages/Profile/CharacterProfile";
import { useEffect } from "react";
import { useCharacterStore } from "./store/useCharacterStore";
import { loadCharacters } from "./utils/loadCharacter";
import { IconChevronRight } from "@tabler/icons-react";
import SpellPage from "./pages/Spells/SpellPage";
import { decodeToken } from "./utils/decodeToken";
import { handleLogout } from "./utils/handleLogout";
import { showNotification } from "./components/Notification/Notification";
import { SectionColor } from "./types/SectionColor";
import { CharacterFormPage } from "./pages/CharacterForm/CharacterFormPage";
import { AdminDashboard } from "./pages/Admin/AdminDashboard";
import { Notifications } from "@mantine/notifications";
import NotesPage from "./pages/Notes/NotesPage";

export default function AppContent() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  let token = useAuthStore((s) => s.token);
  const [opened, handlers] = useDisclosure(false);
  const { characters } = useCharacterStore();
  const location = useLocation();
  const isAdmin = useAuthStore.getState().roles.includes("Admin");

  const lstoken = localStorage.getItem("authToken");

  function isTokenExpired(token: string): boolean {
    if (!token || token === "") return true;
    const expiry = decodeToken(token)?.exp;
    if (!expiry) return true;
    const now = Date.now() / 1000;
    return expiry < now;
  }

  useEffect(() => {
    if (isTokenExpired(lstoken ?? "") && isTokenExpired(token ?? "")) {
      if (location.pathname === "/register") return;

      showNotification({
        id: "expiredToken",
        title: "Token expired",
        message: "Your login token expired, now logging out.",
        color: SectionColor.Red,
        withBorder: true,
      });

      handleLogout();
      console.log(`✅ User logged out, redirecting to login page.`);
      navigate("/login");
    }

    if (!token && lstoken) token = lstoken;
  }, [token]);

  useEffect(() => {
    const fetchCharacters = async () => {
      if (token && characters.length === 0) await loadCharacters(token);
    };
    fetchCharacters();
  }, [token, characters.length]);

  // Sidebar logic — hide only on Login/Register
  const hideSidebarRoutes = ["/login", "/register"];
  const showSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
      <AppShell
        padding={isMobile ? 0 : "md"}
        header={{ height: 0 }}
        styles={{
          root: {
            background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            minHeight: "100vh",
          },
          main: {
            position: "relative",
            minHeight: "100vh",
            overflow: "hidden",
            background: "transparent",
            padding: isMobile ? 0 : undefined,
          },
        }}
      >
        {/* Sidebar Drawer */}
        {showSidebar && <Sidebar opened={opened} onClose={handlers.close} />}

        <AppShell.Main>
          {/* BACKGROUND IMAGE */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 0,
              backgroundImage:
                "url(https://images.hdqwalls.com/wallpapers/you-are-mine-bird-7s.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              transform: "scale(1.02)",
            }}
          />

          {/* GLASS OVERLAY */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              background: "rgba(0, 0, 0, 0.62)",
              backdropFilter: "blur(8px) saturate(130%)",
              WebkitBackdropFilter: "blur(4px) saturate(100%)",
              pointerEvents: "none",
            }}
          />

          {/* CONTENT */}
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
                {isAdmin && <Route path="/dashboard" element={<AdminDashboard />} />}
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Notifications position="bottom-right" />
        </AppShell.Main>

        {/* Drawer Toggle */}
        {showSidebar && (
          <ActionIcon
            variant="filled"
            size="lg"
            onClick={handlers.toggle}
            style={{
              position: "fixed",
              bottom: isMobile ? 14 : 10,
              left: isMobile ? 14 : 10,
              zIndex: 999,
              cursor: "pointer",
              padding: 5,
              backgroundColor: "#26224eff",
              border: "3px solid",
              borderImageSlice: 1,
              borderWidth: 3,
              borderImageSource:
                "linear-gradient(45deg, #ff6ec4, #7873f5, #42e695)",
              transition: "all 0.3s ease",
            }}
          >
            <IconChevronRight
              size={24}
              style={{
                transform: opened ? "rotate(180deg)" : "none",
                transition: "transform 0.3s ease",
              }}
            />
          </ActionIcon>
        )}
      </AppShell>
  );
}
