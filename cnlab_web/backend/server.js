const WebSocket = require("ws");
const { exec } = require("child_process");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const port = 8000;
const host = "192.168.1.254"; // Change this to your NIC's IP address

// arar

const corsOptions = {
  origin: `http://192.168.1.254:3000`,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

let networkDict = {};
ROUTER_NIC = "enx00e04c362790";
const networkInterfaces = require("./NIC.js");
networkInterfaces(ROUTER_NIC).forEach((interfaceInfo) => {
  networkDict[interfaceInfo.interface] = {
    ip: interfaceInfo.ip,
    netmask: interfaceInfo.netmask,
    gateway: interfaceInfo.gateway,
  };
});

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

console.log(`Server started on ${host}:8080`);

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
  nics = await updateUserNICs(username, nic, "add", ip_last);
  console.log("nics", nics);
  if (nics) update_IP_table(ip_last, nics, res);
});

app.post("/turn_off", async (req, res) => {
  const ip_last = req.ip.match(/(\d+)$/)[1];
  const { nic, username } = req.body;
  console.log(`${ip_last} Turning off ${nic}`);
  nics = await updateUserNICs(username, nic, "remove", ip_last);
  console.log("nics", nics);
  if (nics) update_IP_table(ip_last, nics, res);
});

const update_IP_table = (ip_last, nics, res) => {
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  fs.readFile("data/password.json", "utf8", (err, data) => {
    if (err) {
      console.error(`File read error: ${err}`);
      res.status(500).send("Internal Server Error");
      return;
    }

    const users = JSON.parse(data);
    const user = users.find(
      (u) => u.Account === username && u.Password === password
    );

    if (user) {
      res.json({ success: true, username });
    } else {
      res.json({ success: false });
    }
  });
});

app.get("/user/:username", (req, res) => {
  const username = req.params.username;
  const filepath = `./data/${username}.json`;

  fs.readFile(filepath, "utf8", (err, data) => {
    if (err) {
      console.error(`File read error: ${err}`);
      res.status(404).send("User not found");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

app.get("/network-speed", async (req, res) => {
  try {
    const data = fs.readFileSync("speed.json", "utf8");
    console.log(data);
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/nics", (req, res) => {
  const nics = Object.keys(networkDict);
  console.log(nics);
  res.json(nics);
});
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send("Hello");
});

app.listen(port, host, () => {
  console.log(`HTTP server started on http://${host}:${port}`);
});
