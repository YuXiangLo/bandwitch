import React, { useContext, useEffect } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Box, Typography, CircularProgress, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../context/AppContext';

const backendws = process.env.REACT_APP_BACKEND_WS;

function CpuMonitor({ width = '100%', height = '100%' }) {
    const { cpuData, setCpuData, averageCpuUsage, setAverageCpuUsage } = useContext(AppContext);
    const maxDataPoints = 50; // Maximum number of data points in the graph

    useEffect(() => {
        const rws = new ReconnectingWebSocket(`${backendws}`);
        rws.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'cpu') {
                const timestamp = new Date().toLocaleTimeString('en-GB', {hour12: false});
                const newEntry = {
                    name: timestamp, // Timestamp
                    ...message.data // CPU data for each core
                };
                const totalUsage = Object.values(message.data).reduce((acc, usage) => acc + usage, 0);
                const averageUsage = totalUsage / Object.keys(message.data).length;

                newEntry.avgCpuUsage = averageUsage; // Add average usage to the new data entry
                setAverageCpuUsage(averageUsage);  // Update the average CPU usage state

                setCpuData(currentData => {
                    const newData = [...currentData, newEntry];
                    return newData.length > maxDataPoints ? newData.slice(1) : newData;
                });
            }
        });

        return () => rws.close();
    }, [setCpuData, setAverageCpuUsage]);

    const getColor = (value) => {
        return value <= 35 ? 'success' : value <= 70 ? 'warning' : 'error';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width, height }}>
            <Typography variant="h5" sx={{ color: '#ffffff', mb: 2 }}>
                CPU Usage Monitor
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                {cpuData.length > 0 && Object.keys(cpuData[cpuData.length - 1]).filter(key => key !== 'name' && key !== 'avgCpuUsage').map((core, index) => (
                    <Box key={core} sx={{ textAlign: 'center' }}>
                        <Typography variant="overline" sx={{ color: '#ffffff' }}>
                            {core.toUpperCase()} {/* Display core names */}
                        </Typography>
                        <CircularProgress
                            variant="determinate"
                            value={cpuData[cpuData.length - 1][core]}
                            color={getColor(cpuData[cpuData.length - 1][core])}
                            size={40}
                        />
                    </Box>
                ))}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="overline" sx={{ color: '#ffffff' }}>
                        AVERAGE USAGE
                    </Typography>
                    <CircularProgress
                        variant="determinate"
                        value={averageCpuUsage}
                        color={getColor(averageCpuUsage)}
                        size={40}
                    />
                </Box>
            </Stack>
            <Box sx={{ width: '90%', height: '55%', mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cpuData}>
                        <CartesianGrid stroke="none" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {Object.keys(cpuData[0] || {}).filter(key => key !== 'name' && key !== 'avgCpuUsage').map((core, idx) => (
                            <Line key={idx} type="monotone" dataKey={core} stroke="#505050" dot={false} isAnimationActive={false} />
                        ))}
                        <Line type="monotone" dataKey="avgCpuUsage" stroke="#dddddd" dot={false} isAnimationActive={false} label="Average CPU Usage" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
}

export default CpuMonitor;

