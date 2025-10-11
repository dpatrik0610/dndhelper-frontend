import {  useEffect, useState } from 'react'
import { TextInput, PasswordInput, Button, Title, Text } from '@mantine/core'
import type { LoginRequest } from '../../types/auth'
import { loginUser } from '../../api/auth'
import { useAuthStore } from '../../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { decodeToken } from '../../utils/decodeToken'
import { useLoadingNotification } from '../../components/Notification/LoadingNotification'
import AlreadyLoggedIn from './AlreadyLoggedIn'

export default function LoginForm() {
    const localAuthToken = localStorage.getItem("authToken");

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const {token, setAuthData} = useAuthStore();
    const navigate = useNavigate()
    const toggleNotification = useLoadingNotification({
        title: 'Logging in...',
        message: 'Please wait',
        successTitle: 'Login Successful',
        successMessage: `Welcome back, ${username}!`,
        errorTitle: 'Login Failed',
        errorMessage: 'Check your credentials',
        autoClose: 2000,
    });

    function timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay))
    }

    useEffect(()=> {
        if(localAuthToken) {
            processToken(localAuthToken);
        }
    }, [localAuthToken])

    const handleLogin = async () => {
        const credentials: LoginRequest = { username, password };

        toggleNotification(true); // show loading

        try {
            const response = await loginUser(credentials);
            await timeout(1000);

            localStorage.setItem("authToken", response.token);
            localStorage.setItem("username", username);
            processToken(response.token);

            toggleNotification(false, true); // success
            navigate("/");
        } catch (err) {
            toggleNotification(false, false); // failure
        }
    };

    const processToken = (token: string) =>{
        const decoded = decodeToken(token);

        if (!decoded) throw new Error("Failed to decode token");
        try{
            setAuthData({
                token: token,
                id: decoded.id || "",
                username: decoded.username || "",
                roles: decoded.roles || [],
            });
            console.log(`Auth data stored in store: \n 
                UserID: ${useAuthStore.getState().id}\n
                Token: ${useAuthStore.getState().token}\n
                Username: ${useAuthStore.getState().username}\n
                Roles: ${useAuthStore.getState().roles}\n
                `)
        }
        catch(ex) {
            console.log(`Error setting auth data: ${ex}`)
            throw Error(`${ex}`);
        }
    }

    if (token) {
        return <AlreadyLoggedIn />
    }

    return (
        <>
        <Title ta='center' order={2}>🌠 D&D Login </Title>
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
            Don't have an account? <Text component="span" color="blue"><a href='/register'>Sign up</a></Text>
        </Text>
        </>
    )
}
