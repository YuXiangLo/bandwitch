import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [cpuData, setCpuData] = useState([]);
    const [averageCpuUsage, setAverageCpuUsage] = useState(0);
    const [networkData, setNetworkData] = useState({});
    const [loading, setLoading] = useState(true);
    const [speedData, setSpeedData] = useState({ download_speed: 0, upload_speed: 0 });
	const [user, setUser] = useState({ User: '', IP:'', NICs: [] })

    return (
        <AppContext.Provider value={{
            cpuData, setCpuData,
            averageCpuUsage, setAverageCpuUsage,
            networkData, setNetworkData,
			loading, setLoading,
			speedData, setSpeedData,
			user, setUser
        }}>
            {children}
        </AppContext.Provider>
    );
};

