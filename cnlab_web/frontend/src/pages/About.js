import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import axios from 'axios';

import CpuMonitor from "../components/CpuMonitor";
import NetworkMonitor from "../components/NetworkMonitor";
import NetworkSpeed from "../components/NetworkSpeed";

// Create a styled Box component with a grey background
const StyledBox = styled(Box)({
    backgroundColor: '#272727', // Light grey color
    width: '100vw', // Full viewport width
    height: '100vh', // Full viewport height
    display: 'flex',
	flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
});

const backendapi = process.env.REACT_APP_BACKEND_API;

function HomePage() {
    const [nics, setNics] = useState([]);

    useEffect(() => {
        // Fetch the list of NICs from the backend
        const fetchNics = async () => {
            try {
                const response = await axios.get(`${backendapi}/nics`); // Adjust the URL to match your server configuration
                setNics(response.data);
            } catch (error) {
                console.error('Error fetching NICs:', error);
            }
        };

        fetchNics();
    }, []);

    return (
        <StyledBox>
            <CpuMonitor width="60%" height="40%" />
            {nics.map(nic => (
                <NetworkMonitor key={nic} nic={nic} width="60%" height="25%" />
            ))}
            <NetworkSpeed />
        </StyledBox>
    );
}

export default HomePage;

