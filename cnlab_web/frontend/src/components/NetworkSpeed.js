import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AppContext } from '../context/AppContext';

const backendapi = process.env.REACT_APP_BACKEND_API;
console.log(`backendapi: ${backendapi}`)

function NetworkSpeed() {
	const { loading, setLoading, speedData, setSpeedData } = useContext(AppContext)

    useEffect(() => {
        console.log('Fetching network speed data...');
		const fetch = async () => {
			try {
				const response = await axios.get(`${backendapi}/network-speed`);
				const data = response.data
				console.log("Data is: ", data)
				console.log(data.download_speed)
				console.log(data.upload_speed)
				setSpeedData({download_speed: +data.download_speed, upload_speed: +data.upload_speed});
				setLoading(false);
			} catch (err) {
				console.error('Error fetching network speed:', err);
				setLoading(false);
			}
		}

		fetch();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0, border: 0 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2, color: '#ffffff', padding: 0, border: 0 }}>Loading network speed...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 0, border: 0 }}>
            <Typography variant="h4" sx={{ mb: 2, color: '#ffffff', fontSize: '1.5rem', padding: 0, border: 0 }}>Network Speed</Typography>
            <Typography variant="h6" sx={{ color: '#ffffff', fontSize: '1rem', padding: 0, border: 0 }}>Download Speed: {speedData.download_speed.toFixed(2)} Mbps</Typography>
            <Typography variant="h6" sx={{ color: '#ffffff', fontSize: '1rem', padding: 0, border: 0 }}>Upload Speed: {speedData.upload_speed.toFixed(2)} Mbps</Typography>
        </Box>
    );
}

export default NetworkSpeed;

