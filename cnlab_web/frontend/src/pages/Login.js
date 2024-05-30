import React, { useState, useContext } from 'react';
import { TextField, Button, Paper, Box, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { keyframes } from '@emotion/react';
import { css } from '@emotion/css';
import { AppContext } from '../context/AppContext';

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const backendapi = process.env.REACT_APP_BACKEND_API;

function LoginPage() {
    const navigate = useNavigate();
	const { setUser } = useContext(AppContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    
	const handleLogin = async () => {
        try {
            const response = await fetch(`${backendapi}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                const userResponse = await fetch(`${backendapi}/user/${username}`);
                const userData = await userResponse.json();
                setUser(userData);
                navigate('/about');
            } else {
                setLoginAttempts(prev => prev + 1);
                setErrorMessage('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('An error occurred during login');
        }
    };

    const errorClass = css`
        margin-top: 16px;
        text-align: center;
        color: red;
        animation: ${shake} 0.5s;
    `;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                bgcolor: '#272727'
            }}
        >
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Login
                </Typography>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <Button variant="contained" color="primary" fullWidth type="submit">
                        Login
                    </Button>
                    {errorMessage && (
                        <Typography
                            key={loginAttempts} // Use loginAttempts as the key to force re-render
                            variant="body2"
                            className={errorClass}
                        >
                            {errorMessage}
                        </Typography>
                    )}
                </form>
            </Paper>
        </Box>
    );
}

export default LoginPage;

