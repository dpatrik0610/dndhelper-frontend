import { useState } from 'react';
import {
  AppShell,
  Group,
  Button,
  NavLink,
  Stack,
  Title,
} from '@mantine/core';
import {
  IconUsers,
  IconSettings,
  IconDashboard,
  IconCategory,
  IconUser,
  IconShoppingCart,
} from '@tabler/icons-react';
import { DashboardSection } from './components/Sections/DashboardSection';

// Import your modals and pages
// import { UserModal } from './UserModal';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userModalOpened, setUserModalOpened] = useState(false);

  const navItems = [
    { icon: IconDashboard, label: 'Dashboard', value: 'dashboard' },
    { icon: IconUsers, label: 'Users', value: 'users' },
    { icon: IconCategory, label: 'Categories', value: 'categories' },
    { icon: IconSettings, label: 'Settings', value: 'settings' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
    //   case 'users':
    //     return <UsersSection onAddUser={() => setUserModalOpened(true)} />;
    //   case 'categories':
    //     return <CategoriesSection />;
    //   case 'settings':
    //     return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <>
    {renderContent()}
    {/* Modals */}
    {/* <UserModal
        opened={userModalOpened}
        onClose={() => setUserModalOpened(false)}
        mode="create"
    />

    <ProductModal
        opened={productModalOpened}
        onClose={() => setProductModalOpened(false)}
        mode="create"
    /> */}
    </>
  );
};