const os = require("os");
const { execSync } = require("child_process");

const getGateway = (interfaceName) => {
  try {
    const command = `ip route show default dev ${interfaceName}`;
    console.log(command);
    const result = execSync(command).toString();
    const match = result.match(/default via (\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error(`Error getting gateway for ${interfaceName}: ${error}`);
    return null;
  }
};

function networkInterfaces(routerNic) {
  const interfaces = os.networkInterfaces();
  let result = [];
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interfaceInfo) => {
      if (interfaceInfo.family === "IPv4") {
        const gateway = getGateway(interfaceName);
        result.push({
          interface: interfaceName,
          ip: interfaceInfo.address,
          netmask: interfaceInfo.netmask,
          gateway: gateway,
        });
      }
    });
  });
  return result.filter(
    (interfaceInfo) =>
      interfaceInfo.interface !== "lo" &&
      interfaceInfo.gateway !== null &&
      interfaceInfo.interface !== routerNic
  );
}
module.exports = networkInterfaces;
