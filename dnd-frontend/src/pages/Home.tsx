import {Title, Container} from '@mantine/core'

export default function Home() {
    return (
        <Container mt="md" ta={"center"}>
            <Title order={2}>Home Page</Title>
            <p>Welcome to the DND Helper dashboard!</p>
        </Container>
    )
}