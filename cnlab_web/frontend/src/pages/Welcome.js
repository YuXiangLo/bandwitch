import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { css, keyframes } from '@emotion/css';

function LoginPage() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/about');
    };

    const circularImageContainer = css`
        width: 15vw;
        height: 15vw;
		min-width: 10em;
		min-height: 10em;
        border-radius: 50%;
        opacity: 0.6;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1em;
        background-image: url('pic/bandwitch.png');
        background-size: cover;
        background-position: center;
    `;

    const rainbowAnimation = keyframes`
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
    `;

    const rainbowText = css`
        background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet, red, orange, yellow);
        background-size: 400%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: ${rainbowAnimation} 1s linear infinite;
        margin-bottom: 1em;
        max-font-size: 2em;
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
            <Typography
                variant="h4"
                sx={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    marginBottom: '1em'
                }}
                className={rainbowText}
            >
                BandWitch
            </Typography>
            <Box className={circularImageContainer}></Box>
            <Button
                variant="contained"
                onClick={handleStart}
                sx={{
                    marginTop: '1em',
                    backgroundColor: '#353535',
                    '&:hover': {
                        backgroundColor: '#afffff',
                        color: '#000000'
                    },
                }}
            >
                Start
            </Button>
        </Box>
    );
}

export default LoginPage;

