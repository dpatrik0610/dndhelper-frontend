import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import type { JSX, ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
