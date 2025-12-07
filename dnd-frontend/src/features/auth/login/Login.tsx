import { Container } from '@mantine/core'
import { Paper } from '@mantine/core'
import LoginForm from './LoginForm'
import "@features/auth/styles/AuthCard.css"

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
      <Paper className="login-card" radius="md" style={{ width: 350 }}>
        <div className="login-card-inner">
          <LoginForm />
        </div>
      </Paper>
    </Container>
  )
}
