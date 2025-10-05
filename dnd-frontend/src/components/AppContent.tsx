import { Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuthStore } from '../store/useAuthStore';
import PrivateRoute from '../components/PrivateRoute';
import Sidebar from '../components/Sidebar/Sidebar';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import NotFound from '../pages/NotFound/NotFound';

export default function AppContent() {
  const [opened, { toggle }] = useDisclosure(true);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  const hideSidebar = ['/login', '/register'].includes(location.pathname);

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
        main: {
          background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
          minHeight: '100vh',
        },
      }}
    >
      {!hideSidebar && (
        <AppShell.Navbar>
          <Sidebar />
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
