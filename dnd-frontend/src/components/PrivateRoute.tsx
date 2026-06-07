import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth/authStore';

export default function PrivateRoute() {
  const token = useAuthStore((state: any) => state.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
