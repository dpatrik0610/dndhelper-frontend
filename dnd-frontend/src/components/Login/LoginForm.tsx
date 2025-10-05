import { useState } from 'react'
import { TextInput, PasswordInput, Button, Title, Text, Group } from '@mantine/core'
import type { LoginRequest } from '../../types/auth'
import { loginUser } from '../../api/auth'
import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>('')
  const setAuth = useAuthStore((state) => state.setToken)
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  
  if (token) {
    return <>
        <Text>You are already logged in.</Text>
        <Button mt="md" fullWidth onClick={() => {
            useAuthStore.getState().clearToken()
            localStorage.removeItem('authToken')
            localStorage.removeItem('username')
            navigate('/login')
        }}>Logout</Button>
    </>
  }

  const handleLogin = async () => {
    console.log('Login attempt', { username, password })

    setLoading(true)
    setError('')

    const payload: LoginRequest = {username, password}
    try {
        const response = await loginUser(payload)
        setAuth(response.token, username)

        localStorage.setItem('authToken', response.token)
        localStorage.setItem('username', username)

        console.log(useAuthStore.getState())
        navigate('/')
    }
    catch (err) {
        console.error('Login failed', err)
        setError('Login failed. Please check your credentials.')
    }
    finally {
        setLoading(false)
    }
  }

  return (
    <>
    <Group align="center" mb="md">
        <Title order={2}>🌠 D&D Login</Title>
    </Group>

    {error && <Text color="red" mb="sm">{error}</Text>}
    <TextInput
        label="Username"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        mb="sm"
    />
    <PasswordInput
        label="Password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        mb="md"
    />
    <Button fullWidth onClick={handleLogin}>
        Login
    </Button>

    <Text size="sm" mt="md" c="dimmed" ta="center">
        Don't have an account? <Text component="span" color="blue">Sign up</Text>
    </Text>
    </>
  )
}
