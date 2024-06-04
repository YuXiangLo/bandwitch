import React, { useContext } from 'react';
import { Box, Typography, CircularProgress, Grid, useMediaQuery } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../context/AppContext';

function CpuMonitor({ width = '100vw', height = '95vh' }) {
    const { cpuData, averageCpuUsage } = useContext(AppContext);
    const isSmallScreen = useMediaQuery('(max-width:1200px)'); // Detect if the screen width is under 1200px
    const isVerySmallScreen = useMediaQuery('(max-width:600px)'); // Detect if the screen width is under 500px

    const getColor = (value) => {
        return value <= 35 ? 'success' : value <= 70 ? 'warning' : 'error';
    };

    const coreComponents = cpuData.length > 0 ? Object.keys(cpuData[cpuData.length - 1])
        .filter(key => key !== 'name' && key !== 'avgCpuUsage')
        .map((core) => (
            <Box key={core} sx={{ textAlign: 'center', mb: isSmallScreen ? 2 : 0 }}>
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
        )) : [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width, height }}>
            <Typography variant="h4" sx={{ color: '#ffffff', mb: 10 }}>
                CPU Usage Monitor
            </Typography>
            {isVerySmallScreen || (
                <Grid container spacing={2} justifyContent="center">
                    {isSmallScreen ? (
                        <>
                            <Grid item xs={12}>
                                <Grid container spacing={2} justifyContent="center">
                                    {coreComponents.slice(0, Math.ceil(coreComponents.length / 2))}
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2} justifyContent="center">
                                    {coreComponents.slice(Math.ceil(coreComponents.length / 2))}
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <>
                            {coreComponents}
                            <Box key="avg" sx={{ textAlign: 'center', mb: isSmallScreen ? 2 : 0 }}>
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
                        </>
                    )}
                </Grid>
            )}
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', mr: 5 }}>
                <Box sx={{ width: '80%', height: isVerySmallScreen ? '40%' : '60%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cpuData}>
                            <CartesianGrid stroke="none" />
                            {isVerySmallScreen ? <XAxis dataKey=" "/> : <XAxis dataKey="name" />}
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
        </Box>
    );
}

export default CpuMonitor;

