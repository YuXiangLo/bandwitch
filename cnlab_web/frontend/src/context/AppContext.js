import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [cpuData, setCpuData] = useState([]);
    const [averageCpuUsage, setAverageCpuUsage] = useState(0);
    const [networkData, setNetworkData] = useState({});
    const [loading, setLoading] = useState(true);
	const [IP, setIP] = useState('')

    return (
        <AppContext.Provider value={{
            cpuData, setCpuData,
            averageCpuUsage, setAverageCpuUsage,
            networkData, setNetworkData,
			loading, setLoading,
			IP, setIP
        }}>
            {children}
        </AppContext.Provider>
    );
};

