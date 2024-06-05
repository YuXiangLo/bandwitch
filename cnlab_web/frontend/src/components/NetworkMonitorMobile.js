import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, Switch, Slider } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const backendapi = process.env.REACT_APP_BACKEND_API;

function NetworkMonitorMobile({ nic, color }) {
  const { networkData, setNetworkData, user } = useContext(AppContext);
  const [speedData, setSpeedData] = useState({
    download_speed: 0,
    upload_speed: 0,
  });
  const [switchStates, setSwitchStates] = useState({});

  useEffect(() => {
    console.log("Fetching network speed data...");
    (async () => {
      try {
        const response = await axios.get(
          `${backendapi}/network-speed?nic=${nic}`
        );
        const data = response.data;
        console.log("Data is:", data);
        setSpeedData({
          download_speed: +data.download_speed,
          upload_speed: +data.upload_speed,
        });
      } catch (err) {
        console.error("Error fetching network speed:", err);
      }
      //fetchSwitchState
      try {
        const response = await axios.get(
          `${backendapi}/get_setting?nic=${nic}`
        );
        const data = response.data;
        console.log(nic, data);
        setSwitchStates(data);
      } catch (err) {
        console.error("Error fetching switch state:", err);
      }
    })();
  }, [nic]);

  const handleSwitchChange = async (event) => {
    setSwitchStates(!switchStates);
    const apiEndpoint = !switchStates ? "turn_on" : "turn_off";

    try {
      await axios.post(`${backendapi}/${apiEndpoint}`, {
        nic,
      });
    } catch (error) {
      console.error(`Error calling ${apiEndpoint} API:`, error);
    }
  };
  return (
    <Box
      sx={{
        width: "80%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        marginBottom: 5,
      }}
    >
      <Box sx={{ width: "100%", mb: 4 }}>
        <Box sx={{ width: "100%", height: "40%", mb: 4 }}>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={networkData[nic] || []}>
              <CartesianGrid stroke="none" />
              <XAxis
                dataKey="time"
                strokeWidth={2}
                tick={{ fontSize: "10px" }}
              />
              <YAxis strokeWidth={2} tick={{ fontSize: "10px" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="receiveRate"
                stroke={color}
                dot={false}
                isAnimationActive={false}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
          <Typography
            variant="inherit"
            sx={{
              color: "#ffffff",
              textAlign: "center",
              fontSize: "10px",
              mt: 1,
            }}
          >
            Download (KB/s)
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            {" "}
            {nic}{" "}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Switch
              color="secondary"
              onChange={handleSwitchChange}
              checked={switchStates}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "50%",
            }}
          ></Box>
          <Typography sx={{ color: "#bdbdbd", fontSize: "12px" }}>
            Max Rate: {speedData.download_speed} Mbps
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default NetworkMonitorMobile;
