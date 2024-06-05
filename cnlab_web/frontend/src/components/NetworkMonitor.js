import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, Stack, Switch } from "@mui/material";
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

function NetworkMonitor({ nic, width = "100%", height = "100%" }) {
  const { networkData, setNetworkData, user } = useContext(AppContext);
  const [speedData, setSpeedData] = useState({
    download_speed: 0,
    upload_speed: 0,
  });
  const [isSwitchChecked, setIsSwitchChecked] = useState(false);

  useEffect(() => {
    console.log("Fetching network speed data...");
    const fetchNetworkSpeed = async () => {
      try {
        const response = await axios.get(
          `${backendapi}/network-speed?nic=${nic}`
        );
        const data = response.data;
        console.log("Data is: ", data);
        setSpeedData({
          download_speed: +data.download_speed,
          upload_speed: +data.upload_speed,
        });
      } catch (err) {
        console.error("Error fetching network speed:", err);
      }
    };

    const fetchSwitchState = async () => {
      try {
        const response = await axios.get(
          `${backendapi}/get_setting?nic=${nic}`
        );
        const data = response.data;
        console.log(nic, data);
        setIsSwitchChecked(data);
      } catch (err) {
        console.error("Error fetching switch state:", err);
      }
    };

    fetchNetworkSpeed();
    fetchSwitchState();
  }, [nic]);

  const handleSwitchChange = async (event) => {
    //const checked = event.target.checked;
    setIsSwitchChecked(!isSwitchChecked);
    const apiEndpoint = !isSwitchChecked ? "turn_on" : "turn_off";

    try {
      await axios.post(`${backendapi}/${apiEndpoint}`, {
        nic,
      });
    } catch (error) {
      console.error(`Error calling ${apiEndpoint} API:`, error);
    }
  };

  const nicData = networkData[nic];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: "120%",
          justifyContent: "space-around",
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "5%",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#ffffff", mb: 0.5, mt: 1.5 }}
          >
            {nic}
          </Typography>
          <Switch
            color="secondary"
            onChange={handleSwitchChange}
            checked={isSwitchChecked}
          />
        </Box>
        {nicData ? (
          <>
            <Box sx={{ width: "45%", height: "80%" }}>
              <Typography
                variant="inherit"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  textAlign: "center",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                Send Rate (KB/s)
              </Typography>
              {nic !== "lo" && (
                <Typography
                  variant="inherit"
                  sx={{
                    color: "#ffffff",
                    mb: 2,
                    textAlign: "center",
                    marginBottom: 0,
                    paddingBottom: 0,
                  }}
                >
                  Max: {speedData.upload_speed} Mbps
                </Typography>
              )}
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={nicData}>
                  <CartesianGrid stroke="none" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sendRate"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ width: "45%", height: "80%" }}>
              <Typography
                variant="inherit"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  textAlign: "center",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                Receive Rate (KB/s)
              </Typography>
              <Typography
                variant="inherit"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  textAlign: "center",
                  marginBottom: 0,
                  paddingBottom: 0,
                }}
              >
                Max: {speedData.download_speed} Mbps
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={nicData}>
                  <CartesianGrid stroke="none" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="receiveRate"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: "#ffffff", mb: 1 }}>
            {nic} is unplugged
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default NetworkMonitor;
