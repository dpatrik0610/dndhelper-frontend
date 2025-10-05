import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@mantine/core'

import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'

import Home from './pages/Home'
import Login from './components/Login/Login'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar/Sidebar'
import { useDisclosure } from '@mantine/hooks'

export default function App() {
  const setAuth = useAuthStore((state) => state.setToken)
  const token = useAuthStore((state) => state.token)
  const [opened, {toggle}] = useDisclosure(true)


  useEffect(() => {
    const storedToken = localStorage.getItem('authToken')
    const username = localStorage.getItem('username')
    if (storedToken && username) setAuth(storedToken, username)
  }, [])

  useEffect(() => {
    if (!token && opened === true) { 
      toggle()
    }
    else if (token && opened === false) {
      toggle()
    }
  }, [token])

  return (
    <BrowserRouter>
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
      
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          {token && <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} /> }
          {!token && <Route path="/login" element={<Login />} /> }
      </Routes>
      </AppShell.Main>
    </AppShell>
    </BrowserRouter>
  )
}
