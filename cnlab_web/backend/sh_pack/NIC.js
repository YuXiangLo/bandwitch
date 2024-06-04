const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const getGateway = (interfaceName) => {
    try {
        const command = `ip route show default dev ${interfaceName}`;
	console.log(command)
        const result = execSync(command).toString();
        const match = result.match(/default via (\d+\.\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
    } catch (error) {
        console.error(`Error getting gateway for ${interfaceName}: ${error}`);
        return null;
    }
};

const configureIpRoute = () => {
    const command = `
        ip a add dev enx00e04c362790 192.168.1.254/24 &&
        ip route del default via 192.168.1.1 2>/dev/null &&
        ip route add 192.168.1.0/24 dev enp0s9 &&
        ip rule flush &&
        ip rule add prio 32766 from all lookup main # for local &&
        ip rule add prio 32767 from all lookup default
    `;
    try {
        execSync(command);
    } catch (error) {
        console.error(`Error configuring network: ${error}`);
    }
};

const sysctl = () => {
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
}

const cleanIptables = () => {
    const iptables = ['filter', 'nat', 'mangle', 'raw'];
    iptables.forEach(t => {
        execSync(`iptables -t ${t} -F && iptables -t ${t} -X`);
    });
    execSync('iptables -Z');
};
cleanIptables();

const configureRoutingTables = () => {
    const gates = ['192.168.1.1', '192.168.1.2']; // Replace with your desired gateway IP addresses
    for (let i = 20; i <= 25; i++) {
        execSync(`ip route flush table ${i}`);
        execSync(`ip route add default proto static scope global table ${i} \
            nexthop via ${gates[0]} weight 1 \
            nexthop via ${gates[1]} weight 1`);
        execSync(`ip rule add prio ${i} from 192.168.1.${i} table ${i}`);
    }
};


const networkInterfaces = () => {
    const interfaces = os.networkInterfaces();
    let result = [];
    Object.keys(interfaces).forEach(interfaceName => {
        interfaces[interfaceName].forEach(interfaceInfo => {
            if (interfaceInfo.family === 'IPv4') {
                const gateway = getGateway(interfaceName);
                result.push({
                    interface: interfaceName,
                    ip: interfaceInfo.address,
                    netmask: interfaceInfo.netmask,
                    gateway: gateway
                });
            }
        });
    });
    return result;
};


