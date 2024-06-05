const { exec } = require('child_process');
const fs = require('fs');

let connectedIPs = [];
const default_content='{"NICs": ["enx6a568d3e01c8","enxaa817ed7ad0c","enxa2fbc5bca920"]}'

// Function to parse the output of dhcp-lease-list command
function parseLeaseList(output) {
    const leases = output.trim().split('\n');
    leases.forEach(lease => {
        const parts = lease.split(/\s+/);
        if (parts.length >= 4 && !connectedIPs.includes(parts[3])) {
    	connectedIPs.push(parts[3])
	ip_last = parts[3].match(/\d+$/)[0]
	console.log(`add ${ip_last}.json`)
	fs.writeFile(`./data/${ip_last}.json`, default_content, 'utf8', (err) => {
	    if (err) 
		console.error('Error writing file:', err);
		
        }
	)
	}
    });
}

// Function to get connected IPs
function getConnectedIPs() {
    exec('dhcp-lease-list --parsable 2>/dev/null', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Command encountered an error: ${stderr}`);
            return;
        }
        parseLeaseList(stdout);
        console.log("Connected IPs:", connectedIPs);
    });
}

// Function to periodically check connected IPs

function monitorConnectedIPs(interval) {
    getConnectedIPs();
    setInterval(getConnectedIPs, interval);
}

// Usage: monitorConnectedIPs(interval_in_milliseconds);
monitorConnectedIPs(3000);
