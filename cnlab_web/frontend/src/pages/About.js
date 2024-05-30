import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

import CpuMonitor from "../components/CpuMonitor";
import NetworkMonitor from "../components/NetworkMonitor";
import NetworkSpeed from "../components/NetworkSpeed";
import useAuth from '../hooks/useAuth';

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

const NIC1 = process.env.REACT_APP_NIC1;
const NIC2 = process.env.REACT_APP_NIC2;

function HomePage() {
    return (
        <StyledBox>
            <CpuMonitor width="60%" height="40%" />
            <NetworkMonitor nic={NIC1} width="60%" height="25%" />
            <NetworkMonitor nic={NIC2} width="60%" height="25%" />
            <NetworkSpeed />
        </StyledBox>
    );
}

export default HomePage;

