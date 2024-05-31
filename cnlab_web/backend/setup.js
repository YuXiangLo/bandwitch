const { execSync } = require("child_process");

const sysctl = () => {
  const command = `
            sysctl -w net.ipv4.ip_forward=1 &&
            sysctl -w net.ipv4.fib_multipath_hash_policy=1 &&
            sysctl -w net.ipv6.conf.all.disable_ipv6=1 &&
            sysctl -w net.ipv6.conf.default.disable_ipv6=1
        `;
  try {
    execSync(command);
  } catch (error) {
    console.error(`Error executing sysctl commands: ${error}`);
  }
};

const configureIpRoute = (routerNic) => {
  const command = `
        ip a add dev ${routerNic} 192.168.1.254/24 ;
        ip route del default via 192.168.1.1 2>/dev/null ;
        ip route add 192.168.1.0/24 dev ${routerNic} ;
        ip rule flush ;
        ip rule add prio 32766 from all lookup main;
        ip rule add prio 32767 from all lookup default
    `;
  try {
    execSync(command);
  } catch (error) {
    console.error(`Error configuring network: ${error}`);
  }
};

const cleanIptables = () => {
  const iptables = ["filter", "nat", "mangle", "raw"];
  iptables.forEach((t) => {
    execSync(`iptables -t ${t} -F && iptables -t ${t} -X`);
  });
  execSync("iptables -Z");
};

const addlocalRouteTables = (gates) => {
  let hops = "";
  for (let j = 0; j < gates.length; j++)
    hops += ` nexthop via ${gates[j]} weight 1`;
  console.log(hops);
  for (let i = 20; i <= 29; i++) {
    try {
      execSync(`ip route flush table ${i}`);
    } catch (error) {}
    try {
      let cmd =
        `ip route add table ${i} default proto static scope global ` + hops;
      console.log(cmd);
      execSync(cmd);
    } catch (error) {}

    try {
      execSync(`ip rule add prio ${i} from 192.168.1.${i} table ${i}`);
    } catch (error) {}
  }
};

const configureMasquerade = (ints) => {
  cleanIptables();
  ints.forEach((int) => {
    execSync(`iptables -t nat -A POSTROUTING -o ${int} -j MASQUERADE`);
  });
};

module.exports = {
  sysctl,
  configureIpRoute,
  addlocalRouteTables,
  configureMasquerade,
};
