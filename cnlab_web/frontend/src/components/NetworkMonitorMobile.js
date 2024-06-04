import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Switch, Slider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const backendapi = process.env.REACT_APP_BACKEND_API;

function NetworkMonitorMobile({ nic }) {
    const { networkData, setNetworkData, user } = useContext(AppContext);
    const [speedData, setSpeedData] = useState({ download_speed: 0, upload_speed: 0 });
    const [switchStates, setSwitchStates] = useState({});
    const [sliderValues, setSliderValues] = useState({});

    useEffect(() => {
        console.log('Fetching network speed data...');
        const fetch = async () => {
            try {
                const response = await axios.get(`${backendapi}/network-speed?nic=${nic}`);
                const data = response.data;
                console.log("Data is:", data);
                setSpeedData({ download_speed: +data.download_speed, upload_speed: +data.upload_speed });
            } catch (err) {
                console.error('Error fetching network speed:', err);
            }
        };

        fetch();

    }, [nic, setNetworkData]);

    const handleSwitchChange = async (nic) => {
        const newSwitchStates = { ...switchStates, [nic]: !switchStates[nic] };
        setSwitchStates(newSwitchStates);

        const apiEndpoint = newSwitchStates[nic] ? 'turn_on' : 'turn_off';

        try {
            await axios.post(`${backendapi}/${apiEndpoint}`, { nic, username: user.User });
        } catch (error) {
            console.error(`Error calling ${apiEndpoint} API:`, error);
            setSwitchStates({ ...switchStates, [nic]: !newSwitchStates[nic] }); // Revert switch state on error
        }
    };

    const handleSliderChange = (nic, newValue) => {
        setSliderValues({ ...sliderValues, [nic]: newValue });
    };

    return (
        <Box sx={{ width: '80%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 5 }}>
            <Box sx={{ width: '100%', mb: 4 }}>
                <Box sx={{ width: '100%', height: '40%', mb: 4 }}>
                    <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={networkData[nic] || []}>
                            <CartesianGrid stroke="none" />
                            <XAxis dataKey="time" strokeWidth={2} tick={{ fontSize: '10px' }} />
                            <YAxis strokeWidth={2} tick={{ fontSize: '10px' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="sendRate" stroke="#00AEAE" dot={false} isAnimationActive={false} strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="inherit" sx={{ color: '#ffffff', textAlign: 'center', fontSize: '10px', mt: 1 }}>Send Rate (KB/s)</Typography>
                </Box>
                <Box sx={{ width: '100%', height: '40%', mb: 4 }}>
                    <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={networkData[nic] || []}>
                            <CartesianGrid stroke="none" />
                            <XAxis dataKey="time" strokeWidth={2} tick={{ fontSize: '10px' }} />
                            <YAxis strokeWidth={2} tick={{ fontSize: '10px' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="receiveRate" stroke="#7777CA" dot={false} isAnimationActive={false} strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="inherit" sx={{ color: '#ffffff', textAlign: 'center', fontSize: '10px', mt: 1 }}>Receive Rate (KB/s)</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold', mr: 2 }}> {nic} </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Switch
                            checked={switchStates[nic]}
                            color="secondary"
                            onChange={() => handleSwitchChange(nic)}
                        />
                    </Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '50%' }}>
						<Typography sx={{ color: '#bdbdbd', fontSize: '12px', mr:3 }}>{sliderValues[nic]}</Typography>
						<Slider
							value={sliderValues[nic]}
							onChange={(event, newValue) => handleSliderChange(nic, newValue)}
							aria-labelledby="horizontal-slider"
							min={1}
							max={100}
							sx={{
								width: '50%', // Make the slider shorter
								mr: 2,
								'& .MuiSlider-thumb': { color: '#ffffff' },
								'& .MuiSlider-track': { color: '#D0D0D0' },
								'& .MuiSlider-rail': { color: '#bdbdbd' },
							}}
						/>
					</Box>
                    <Typography sx={{ color: '#bdbdbd', fontSize: '12px' }}>Max Rate: {speedData.download_speed} Mbps</Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default NetworkMonitorMobile;

