import { Container } from '@mantine/core'
import LoginCard from './LoginCard'
import './Login.css'

export default function Login() {
  return (
    <Container
      fluid
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}
    >
      <LoginCard />
    </Container>
  )
}
