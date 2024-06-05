import React, { useContext, useEffect } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import {
  useMediaQuery,
  AppBar,
  Toolbar,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import NetworkWifiIcon from "@mui/icons-material/NetworkWifi";
import MemoryIcon from "@mui/icons-material/Memory";
import { AppContext } from "../context/AppContext";

function NavBar({ display }) {
  const navigate = useNavigate();
  const { IP, setNetworkData, setCpuData, setAverageCpuUsage } =
    useContext(AppContext);
  const backendws = process.env.REACT_APP_BACKEND_WS;
  const maxDataPoints = 50; // Maximum number of data points in the graph
  const isMobile = useMediaQuery("(max-width:1000px)"); // Define the breakpoint for mobile devices

  useEffect(() => {
    const rws = new ReconnectingWebSocket(`${backendws}`);
    rws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "cpu") {
        const timestamp = new Date().toLocaleTimeString("en-GB", {
          hour12: false,
        });
        const newEntry = {
          name: timestamp, // Timestamp
          ...message.data, // CPU data for each core
        };
        const totalUsage = Object.values(message.data).reduce(
          (acc, usage) => acc + usage,
          0
        );
        const averageUsage = totalUsage / Object.keys(message.data).length;

        newEntry.avgCpuUsage = averageUsage; // Add average usage to the new data entry
        setAverageCpuUsage(averageUsage); // Update the average CPU usage state

        setCpuData((currentData) => {
          const newData = [...currentData, newEntry];
          return newData.length > maxDataPoints ? newData.slice(1) : newData;
        });
      } else if (message.type === "network") {
        for (const nic in message.data) {
          if (message.data[nic]) {
            console.log("Hello", message.data);
            const newEntry = {
              time: new Date().toLocaleTimeString("en-GB", { hour12: false }), // 24-hour format
              sendRate: message.data[nic].bytes_sent_per_sec,
              receiveRate: message.data[nic].bytes_recv_per_sec,
            };
            setNetworkData((currentData) => {
              const newData = {
                ...currentData,
                [nic]: [...(currentData[nic] || []), newEntry],
              };
              return {
                ...newData,
                [nic]:
                  newData[nic].length > maxDataPoints
                    ? newData[nic].slice(1)
                    : newData[nic],
              };
            });
          } else {
            // If the NIC data is not present in the message, set the data to null
            setNetworkData((currentData) => ({
              ...currentData,
              [nic]: null,
            }));
          }
        }
      }
    });

    return () => rws.close();
  }, [backendws, setAverageCpuUsage, setCpuData, setNetworkData]);

  if (display === "none") return <></>;

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#131313" }}>
      <Toolbar>
        <Button
          color="inherit"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ marginRight: isMobile ? 0 : 2, padding: "6px 12px" }}
        >
          {!isMobile ? "Home" : ""}
        </Button>
        <Button
          color="inherit"
          startIcon={<NetworkWifiIcon />}
          onClick={() => navigate("/about")}
          sx={{ marginRight: isMobile ? 0 : 2, padding: "6px 12px" }}
        >
          {!isMobile ? "Network" : ""}
        </Button>
        <Button
          color="inherit"
          startIcon={<MemoryIcon />}
          onClick={() => navigate("/about2")}
          sx={{ marginRight: isMobile ? 0 : 2, padding: "6px 12px" }}
        >
          {!isMobile ? "CPU" : ""}
        </Button>

        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "right" }}>
          {`${IP}`}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
