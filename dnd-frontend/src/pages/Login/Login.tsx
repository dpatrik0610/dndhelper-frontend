import { Container } from '@mantine/core'
import LoginCard from './LoginCard'
import './Login.css'

export default function Login() {
  return (
    <Container
      fluid
      style={{
        height: '95vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <LoginCard />
    </Container>
  )
}
