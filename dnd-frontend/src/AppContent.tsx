import { Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
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
import Equipment from './pages/Equipment/Equipment';
import { ActionIcon } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Inventory } from './pages/Inventory/Inventory';

export default function AppContent() {
  let token = useAuthStore((s) => s.token);
  const [opened, handlers] = useDisclosure(true);
  const { characters } = useCharacterStore();
  const location = useLocation();

  // ✅ Define pages where the sidebar should be visible
  const showSidebarOn = ['/', '/home', '/profile', '/equipment', '/inventory'];
  const showSidebar = showSidebarOn.includes(location.pathname);

  useEffect(() => {
    const lstoken = localStorage.getItem("authToken");
    if (!token && lstoken){
        token = localStorage.getItem("authToken") ?? "Not logged in.";
    }
  }, [token])

  // Toggle sidebar open/close based on page
  useEffect(() => {
    if (showSidebar) handlers.open();
    else handlers.close();
  }, [showSidebar]);

  // Load characters if logged in
  useEffect(() => {
    const fetchCharacters = async () => {
      if (token && characters.length === 0) {
        console.log(`Loading Characters...`)
        await loadCharacters(token);
      }
    };
    fetchCharacters();
  }, [token, characters.length]);

  useEffect(() => {
    if (showSidebar) {
      const timer = setTimeout(() => handlers.close(), 0);
      return () => clearTimeout(timer);
    }
}, [location.pathname, showSidebar]);

  return (
    <AppShell
      padding="md"
      header={{ height: 0 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      styles={{
        root: {
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          minHeight: '100vh',
        },
        main: {
          background: 'transparent',
        },
      }}
    >
      {showSidebar && (
        <AppShell.Navbar>
          <Sidebar />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path='/equipment' element={<Equipment/>} />
            <Route path='/inventory' element={<Inventory/>} />
            <Route path="/profile" element={<CharacterProfile />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell.Main>

      {/* Sidebar toggle button */}
      {showSidebar && (
      <ActionIcon
        variant="filled"
        size="xl"
        onClick={handlers.toggle}
        style={{
          position: 'fixed',
          bottom: 20,
          left: opened ? 250 + 20 : 20,
          zIndex: 999,
          cursor: 'pointer',
          padding: 8,
          backgroundColor: '#26224eff', // inner background
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
      </ActionIcon> )}
    </AppShell>
  );
}
