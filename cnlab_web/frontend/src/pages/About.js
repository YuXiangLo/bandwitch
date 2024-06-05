import React, { useEffect, useState, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Box, useMediaQuery, Typography } from "@mui/material";
import axios from "axios";

import NetworkMonitor from "../components/NetworkMonitor";
import NetworkMonitorMobile from "../components/NetworkMonitorMobile";
import { AppContext } from "../context/AppContext";

// Create a styled Box component with a grey background
const StyledBox = styled(Box)({
  backgroundColor: "#272727", // Light grey color
  width: "100vw", // Full viewport width
  minHeight: "100vh", // Full viewport height
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  paddingTop: "70px",
});

const backendapi = process.env.REACT_APP_BACKEND_API;

function HomePage() {
  const { setIP } = useContext(AppContext);
  const [nics, setNics] = useState([]);
  const isMobile = useMediaQuery("(max-width:1000px)"); // Define the breakpoint for mobile devices

  useEffect(() => {
    // Fetch the list of NICs from the backend
    const fetchNics = async () => {
      const response = await axios.get(`${backendapi}/nics`);
      console.log(response);
      setNics(response.data.nics);
      setIP(String(response.data.ip));
    };

    fetchNics();
  }, [setIP]);

  return (
    <StyledBox>
      <Typography variant="h4" sx={{ color: "#ffffff", margin: "20px 0" }}>
        Network Monitor
      </Typography>
      {nics.map((nic, index) =>
        isMobile ? (
          <NetworkMonitorMobile
            key={nic}
            nic={nic}
            color={index & 1 ? "#7777CA" : "#00AEAE"}
            width="100%"
            height="30%"
          />
        ) : (
          <NetworkMonitor key={nic} nic={nic} width="60vw" height="25vh" />
        )
      )}
    </StyledBox>
  );
}

export default HomePage;
