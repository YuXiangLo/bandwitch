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

/*
const splitAccess = (interfaces) => {
  interfaces.forEach((intf, index) => {
    const { name, ip, network, gateway } = intf;
    const table = index + 1; // Assuming table numbers start from 1

    try {
      execSync(`ip route add ${network} dev ${name} src ${ip} table T${table}`);
      execSync(`ip route add default via ${gateway} table T${table}`);
      execSync(`ip route add ${network} dev ${name} src ${ip}`);
      execSync(`ip rule add from ${ip} table T${table}`);
    } catch (error) {
      console.error(`Error configuring interface ${name}: ${error}`);
    }
  });
};
*/
const addToRouteTable254 = () => {
  try {
    execSync(
      `ip route add 172.20.10.0/28 dev enxa2fbc5bca920 proto kernel scope link src 172.20.10.5 metric 102 table 254`
    );
    execSync(
      `ip route add 172.20.10.1 dev enxa2fbc5bca920 scope link src 172.20.10.5 table 254`
    );
    execSync(
      `ip route add 192.168.131.0/24 dev enxa2fc89257e18 proto kernel scope link src 192.168.131.227 metric 101 table 254`
    );
    execSync(`ip route add 192.168.1.0/24 dev wlo1 scope link`);
  } catch (error) {
    console.error(`Error adding routes to table 254: ${error}`);
  }
};

const addlocalRouteTables = (gates) => {
  let hops = "";
  for (let j = 0; j < gates.length; j++)
    hops += ` nexthop via ${gates[j]} weight 1`;
  console.log(hops);
  const tables = [...Array(10).keys()].map((i) => i + 20); //.concat([254]);
  tables.forEach((i) => {
    try {
      execSync(`ip route flush table ${i}`);
    } catch (error) {}
    try {
      let cmd =
        `ip route add table ${i} default proto static scope global ` + hops;
      console.log(cmd);
      execSync(cmd);
    } catch (error) {}
    /*
    if (i === 254) {
      addToRouteTable254();
    }
  */
    try {
      execSync(`ip rule add prio ${i} from 192.168.1.${i} table ${i}`);
    } catch (error) {}
  });
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
