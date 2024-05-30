import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

import NetworkMonitor from "../components/NetworkMonitor";

// Create a styled Box component with a grey background
const StyledBox = styled(Box)({
    backgroundColor: '#272727', // Light grey color
    width: '100vw', // Full viewport width
    height: '100vh', // Full viewport height
	display: 'flex',
	flexDirection: 'column',
    //alignItems: 'center',
    //justifyContent: 'center'
});

function HomePage() {
    return (
        <StyledBox>
            <NetworkMonitor nic="en0"/>
        </StyledBox>
    );
}

export default HomePage;

