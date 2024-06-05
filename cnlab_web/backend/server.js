const WebSocket = require("ws");
const { exec, execSync } = require("child_process");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const port = 8000;
const host = "192.168.1.254"; // Change this to your NIC's IP address

// arar

const corsOptions = {
  origin: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

//dhcp
/*
try {
  execSync("bash default.sh");
} catch (error) {}
*/

exec("./dhcp_hotspot.sh", (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  console.log(`stdout: ${stdout}`);
});

ROUTER_NIC = "wlo1";
let networkDict = {};
const networkInterfaces = require("./NIC.js");
networkInterfaces(ROUTER_NIC).forEach((interfaceInfo) => {
  networkDict[interfaceInfo.interface] = {
    ip: interfaceInfo.ip,
    netmask: interfaceInfo.netmask,
    gateway: interfaceInfo.gateway,
  };
});

for (let i = 20; i <= 29; i++) {
  const data = {
    NICs: Object.keys(networkDict),
  };

  fs.writeFile(`./data/${i}.json`, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
    }
  });
}

// routing
const {
  sysctl,
  configureIpRoute,
  addlocalRouteTables,
  configureMasquerade,
} = require("./setup.js");
sysctl();
configureIpRoute(ROUTER_NIC);
const gateways = Object.keys(networkDict).map((key) => {
  return networkDict[key].gateway;
});
console.log(gateways, Object.keys(networkDict));
addlocalRouteTables(gateways);
configureMasquerade(Object.keys(networkDict));

// speed
speedTest = require("./speed.js");
let networkSpeedResults = {};

const speedTestFunction = async () => {
  const nics = Object.keys(networkDict);
  let serverIp = ["140.112.30.186", "140.112.30.188", "140.112.30.189"];
  for (i = 0; i < nics.length; i++) {
    const nic = nics[i];
    const sip = serverIp[i % 3];
    try {
      networkSpeedResults[nic] = await speedTest(sip, "10", nic);
      console.log(networkSpeedResults[nic]);
    } catch (err) {
      console.error(err);
      networkSpeedResults[nic] = { download_speed: 0, upload_speed: 0 };
    }
  }
};

// Execute immediately
speedTestFunction();

/*
try {
  execSync("bash deldefault.sh");
} catch (error) {}
*/
// Then execute every 2 minutes
const intervalId = setInterval(speedTestFunction, 2 * 60 * 1000);

app.get("/cancel-speedtest", (req, res) => {
  clearInterval(intervalId);
  res.status(200);
  res.send("Speed test cancelled");
});

app.get("/network-speed", (req, res) => {
  const nic = req.query.nic;

  if (!nic) {
    return res.status(400).send("NIC name is required");
  }

  if (!networkSpeedResults[nic]) {
    return res
      .status(404)
      .send("No speed test result found for the requested NIC");
  }

  res.setHeader("Content-Type", "application/json");
  res.send(networkSpeedResults[nic]);
});
//init end

const wss = new WebSocket.Server({ host, port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("A new client Connected!");
  ws.send(JSON.stringify({ type: "message", data: "Welcome New Client!" }));

  const cpuInterval = setInterval(() => {
    exec("python get_cpu.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      ws.send(stdout);
    });
  }, 1000);

  const networkInterval = setInterval(() => {
    exec("python get_network.py", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      ws.send(stdout);
    });
  }, 1000);

  ws.on("close", () => {
    clearInterval(cpuInterval);
    clearInterval(networkInterval);
  });
});

async function updateUserNICs(username, nic, action, ip_last) {
  const filepath = `./data/${ip_last}.json`;
  console.log("user filepath", filepath);
  data = fs.readFileSync(filepath);
  let user = JSON.parse(data);
  console.log(`${ip_last} before:`, user);
  if (action === "add" && !user.NICs.includes(nic)) {
    user.NICs.push(nic);
  } else if (action === "remove") {
    user.NICs = user.NICs.filter((item) => item !== nic);
  }
  console.log(`${ip_last} after:`, user);
  fs.writeFile(filepath, JSON.stringify(user, null, 2), (err, data) => {
    console.error(err);
    return;
  });
  console.log("return nics", user.NICs);
  return user.NICs;
}

app.post("/turn_on", async (req, res) => {
  const ip_last = req.ip.match(/(\d+)$/)[1];
  const { nic, username } = req.body;
  console.log(`${ip_last} Turning on ${nic}`);
  const nics = await updateUserNICs(username, nic, "add", ip_last);
  console.log("nics", nics);
  if (nics) update_route_table(ip_last, nics, res);
});

app.post("/turn_off", async (req, res) => {
  const ip_last = req.ip.match(/(\d+)$/)[1];
  const { nic, username } = req.body;
  console.log(`${ip_last} Turning off ${nic}`);
  const nics = await updateUserNICs(username, nic, "remove", ip_last);
  console.log("nics", nics);
  if (nics) update_route_table(ip_last, nics, res);
});

app.get("/get_setting", (req, res) => {
  const ip_last = req.ip.match(/(\d+)$/)[1];
  const nic = req.query.nic;
  const filepath = `./data/${ip_last}.json`;
  console.log("user filepath", filepath);
  data = fs.readFileSync(filepath);
  let user = JSON.parse(data);
  res.setHeader("Content-Type", "application/text");
  res.send(user.NICs.includes(nic));
});

const update_route_table = (ip_last, nics, res) => {
  const jsonFilePath = `data/${ip_last}.json`;
  let command = `ip route del default table ${ip_last}; ip route add table ${ip_last} default proto static `;

  for (let i = 0; i < nics.length; i++) {
    command += ` nexthop via ${networkDict[nics[i]].gateway} dev ${
      nics[i]
    } weight ${1}`;
  }

  console.log("cmd:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      console.error(stderr);
    }
    res.json({ success: true, stdout, stderr });
  });
};

const userRoutes = require("./userRoutes.js");
app.use(userRoutes);

app.get("/nics", (req, res) => {
  const nics = Object.keys(networkDict);
  const ip = req.ip;
  console.log("ip:", req.ip);
  console.log(nics);
  res.json({ ip, nics });
});

app.get("/ip", (req, res) => {
  res.setHeader("Content-Type", "application/text");
  res.send(req.ip);
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send("Hello");
});

app.listen(port, host, () => {
  console.log(`HTTP server started on http://${host}:${port}`);
});

/*
setTimeout(() => {
  app.listen(port, host, () => {
    console.log(`HTTP server started on http://${host}:${port}`);
  });
}, 20 * 1000); // Delay for 20 seconds
*/
