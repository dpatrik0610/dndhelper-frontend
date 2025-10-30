import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuthStore } from './store/useAuthStore';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import NotFound from './pages/NotFound/NotFound';
import CharacterProfile from './pages/Profile/CharacterProfile';
import { useEffect } from 'react';
import { useCharacterStore } from './store/useCharacterStore';
import { loadCharacters } from './utils/loadCharacter';
import { IconChevronRight } from '@tabler/icons-react';
import { Inventory } from './pages/Inventory/Inventory';
import SpellPage from './pages/Spells/SpellPage';
import { DashboardSection } from './pages/Admin/components/Sections/DashboardSection';
import { decodeToken } from './utils/decodeToken';
import { handleLogout } from './utils/handleLogout';
import { showNotification } from './components/Notification/Notification';
import { SectionColor } from './types/SectionColor';
import { CharacterFormPage } from './pages/CharacterForm/CharacterFormPage';

export default function AppContent() {
  const navigate = useNavigate();
  let token = useAuthStore((s) => s.token);
  const [opened, handlers] = useDisclosure(false);
  const { characters } = useCharacterStore();
  const location = useLocation();
  const isAdmin = useAuthStore.getState().roles.includes("Admin");

  const showSidebarOn = ['/', '/home', '/profile', '/inventory', "/spells", "/dashboard", "/newCharacter", "/editCharacter"];
  const showSidebar = showSidebarOn.includes(location.pathname);
  let lstoken = localStorage.getItem("authToken");

  function isTokenExpired(token : string) : boolean {
    if (!token || token == "") return true;

    // This will be in Seconds
    const expiry = decodeToken(token)?.exp; 
    if (!expiry) return true;

    const now = Date.now() / 1000; // In seconds
    const isExpired = expiry < now;

    return isExpired;
    }

  useEffect(() => {
    if (isTokenExpired(lstoken ?? "") && isTokenExpired(token ?? "") ) {
      if (location.pathname == "/register") return;
      
      showNotification({
        id: "expiredToken",
        title: "Token expired",
        message: "Your login token expired, now logging out.",
        color: SectionColor.Red,
        withBorder: true,
      })

      handleLogout();
      console.log(`✅ User logged out, redirecting to login page.`);
      navigate("/login");
    }

    if (!token && lstoken) {
        token = lstoken;
    }
  }, [token]);

  // Load characters if logged in
  useEffect(() => {
    const fetchCharacters = async () => {
      if (token && characters.length === 0) {
        await loadCharacters(token);
      }
    };
    fetchCharacters();
  }, [token, characters.length]);

  return (
    <AppShell
      padding="md"
      header={{ height: 0 }}
      styles={{
        root: {
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          minHeight: '100vh',
        },
        main: { background: 'transparent' },
      }}
    >
      {/* Sidebar Drawer */}
      {showSidebar && (
        <Sidebar opened={opened} onClose={handlers.close} />
      )}

      {/* Main App Content */}
      <AppShell.Main>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path='/inventory' element={<Inventory/>} />
            <Route path="/profile" element={<CharacterProfile />} />
            <Route path='/spells' element={<SpellPage/>} />
            <Route path='/newCharacter' element={<CharacterFormPage/>} />
            <Route path='/editCharacter' element={<CharacterFormPage editMode = {true}/>} />
            {isAdmin &&
              <Route path='/dashboard' element={<DashboardSection />}/>
            }
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell.Main>

      {/* Drawer Toggle Button */}
      {showSidebar && (
        <ActionIcon
          variant="filled"
          size="lg"
          onClick={handlers.toggle}
          style={{
            position: 'fixed',
            bottom: 10,
            left: 10,
            zIndex: 999,
            cursor: 'pointer',
            padding: 5,
            backgroundColor: '#26224eff',
            border: '3px solid',
            borderImageSlice: 1,
            borderWidth: 3,
            borderImageSource: 'linear-gradient(45deg, #ff6ec4, #7873f5, #42e695)',
            transition: 'all 0.3s ease',
          }}
        >
          <IconChevronRight
            size={24}
            style={{
              transform: opened ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s ease',
            }}
          />
        </ActionIcon>
      )}
    </AppShell>
  );
}
