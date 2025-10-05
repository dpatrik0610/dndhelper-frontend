import { Container, Paper, Title, Text, Button, Group } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <Container className="notfound-container">
      <Paper className="notfound-card" radius="md" p="xl">
        <Title order={1} ta="center">404</Title>
        <Text size="lg" mt="lg" mb="lg" ta="center">Oops! You lost your way along your <b>Adventure</b>.</Text>
        <Button ta="center" mt="md" onClick={() => navigate('/')}>Go Home :/</Button>
      </Paper>
    </Container>
  )
}
