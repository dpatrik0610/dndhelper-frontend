import { Paper } from '@mantine/core'
import LoginForm from './LoginForm'

export default function LoginCard() {
  return (
    <Paper className="login-card" radius="md" style={{ width: 350 }}>
      <div className="login-card-inner">
        <LoginForm />
      </div>
    </Paper>
  )
}
