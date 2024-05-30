import React, { useContext, useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Box, Typography, Stack, Switch } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const backendws = process.env.REACT_APP_BACKEND_WS;
const backendapi = process.env.REACT_APP_BACKEND_API;

function NetworkMonitor({ nic, width = '100%', height = '100%' }) {
    const { networkData, setNetworkData, user } = useContext(AppContext);
    const maxDataPoints = 50; // Maximum number of data points in the graph

    useEffect(() => {
        const rws = new ReconnectingWebSocket(`${backendws}`);
        rws.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'network' && message.data[nic]) {
                const newEntry = {
                    time: new Date().toLocaleTimeString('en-GB', { hour12: false }), // 24-hour format
                    sendRate: message.data[nic].bytes_sent_per_sec,
                    receiveRate: message.data[nic].bytes_recv_per_sec
                };
                setNetworkData(currentData => {
                    const newData = {
                        ...currentData,
                        [nic]: [...(currentData[nic] || []), newEntry]
                    };
                    return {
                        ...newData,
                        [nic]: newData[nic].length > maxDataPoints ? newData[nic].slice(1) : newData[nic]
                    };
                });
            }
        });

        return () => rws.close();
    }, [nic, setNetworkData]);

	const [isChecked, setIsChecked] = useState(user.NICs.includes(nic));

	const handleSwitchChange = async (event) => {
        const checked = event.target.checked;

        setIsChecked(checked);

        const apiEndpoint = checked ? 'turn_on' : 'turn_off';

        try {
            await axios.post(`${backendapi}/${apiEndpoint}`, { nic, username: user.User });
        } catch (error) {
            console.error(`Error calling ${apiEndpoint} API:`, error);
            // Revert switch state on error
            setIsChecked(!checked);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width,
            height
        }}>
            <Stack direction="row" spacing={2} sx={{ width: '90%', justifyContent: 'space-around', flexGrow: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff', mb: 1 }}>
                        {nic}
                    </Typography>
					<Switch
                        checked={isChecked}
                        color="secondary"
                        onChange={handleSwitchChange}
                    />
                </Box>
                <Box sx={{ width: '45%', height: '80%' }}>
                    <Typography variant="inherit" sx={{ color: '#ffffff', mb: 2, textAlign: 'center', marginBottom: 0, paddingBottom: 0 }}>Send Rate (KB/s)</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={networkData[nic] || []}>
                            <CartesianGrid stroke="none" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sendRate" stroke="#8884d8" dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
                <Box sx={{ width: '45%', height: '80%' }}>
                    <Typography variant="inherit" sx={{ color: '#ffffff', mb: 2, textAlign: 'center', marginBottom: 0, paddingBottom: 0 }}>Receive Rate (KB/s)</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={networkData[nic] || []}>
                            <CartesianGrid stroke="none" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="receiveRate" stroke="#82ca9d" dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Stack>
        </Box>
    );
}

export default NetworkMonitor;

