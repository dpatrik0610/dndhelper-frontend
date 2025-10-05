import { useState } from 'react'
import { Container, Paper, TextInput, Button, Title, Text, Group } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { PasswordStrength } from './PasswordRequirement'
import './Register.css'
import { useAuthStore } from '../../store/useAuthStore'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setToken)

  const handleRegister = () => {
    // TODO: call your API here
    console.log('Register attempt', { username, password })
    // Example: on success, store token & redirect
    const fakeToken = 'FAKE_TOKEN'
    setAuth(fakeToken, username)
    localStorage.setItem('authToken', fakeToken)
    localStorage.setItem('username', username)
    navigate('/')
  }

  return (
    <Container
      fluid
      className="register-container"
    >
      <Paper className="register-card" radius="md" p="xl">
        <Group align="center" mb="md">
          <Title order={2}>🌟 Register</Title>
        </Group>

        <TextInput
          label="Username"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          mb="sm"
        />

        <PasswordStrength value={password} onChange={setPassword}/>
        <Button fullWidth mt="md" onClick={handleRegister}>Register</Button>
        <Text size="sm" mt="md" c="dimmed" ta="center">
          Already have an account? <Text component="span" color="blue" onClick={() => navigate('/login')}>Login</Text>
        </Text>
      </Paper>
    </Container>
  )
}
