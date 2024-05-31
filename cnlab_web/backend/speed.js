const { execSync } = require("child_process");

function runIperf3(serverIp, duration, nic) {
  const uploadResult = JSON.parse(
    execSync(
      `iperf3 -J --bind-dev ${nic} -t ${duration} -c ${serverIp}`
    ).toString()
  );
  const downloadResult = JSON.parse(
    execSync(
      `iperf3 -J -t ${duration} --bind-dev ${nic} -c ${serverIp} -R`
    ).toString()
  );

  const uploadSpeed = uploadResult.end.sum_sent.bits_per_second;
  const downloadSpeed = downloadResult.end.sum_received.bits_per_second;

  const uploadSpeedMbps = uploadSpeed / 1000000;
  const downloadSpeedMbps = downloadSpeed / 1000000;

  const resultJson = {
    download_speed: downloadSpeedMbps.toFixed(2),
    upload_speed: uploadSpeedMbps.toFixed(2),
  };

  return resultJson;
}

module.exports = { runIperf3 };
