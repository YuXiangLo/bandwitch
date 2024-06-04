const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

async function Iperf3(serverIp, duration, nic, download = false) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const output = await execAsync(
        `iperf3 -J --bind-dev ${nic} -t ${duration} -c ${serverIp}` +
          (download ? " -R" : "")
      );
      const speedMbps =
        JSON.parse(output.stdout.toString()).end.sum_received.bits_per_second /
        1000000;
      return speedMbps.toFixed(2);
    } catch (error) {
      console.log(`failed ${attempt}`);
      if (attempt === 2) {
        return 0;
      }
    }
  }
}

async function speedTest(serverIp, duration = "10", nic) {
  const uploadSpeedMbps = await Iperf3(serverIp, duration, nic);
  const downloadSpeedMbps = await Iperf3(serverIp, duration, nic, true);

  const result = {
    download_speed: downloadSpeedMbps,
    upload_speed: uploadSpeedMbps,
  };

  return result;
}

//r = speedTest("140.112.30.188", "10", "wlo1").then((s) => console.log(s));

module.exports = speedTest;
