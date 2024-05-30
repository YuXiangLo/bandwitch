import subprocess
import re
import json

def run_iperf3(server_ip, reverse=False):
    command = f"iperf3 -t 1 -c {server_ip}"
    if reverse:
        command += " -R"
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout

def parse_bitrate(output):
    # Use regex to find the bitrate value in the output
    match = re.search(r'(\d+\.\d+) Mbits/sec', output)
    if match:
        bitrate = float(match.group(1))
        return bitrate
    else:
        return None

def main():
    server_ip = "140.112.30.186"
    
    # Run upload test
    upload_output = run_iperf3(server_ip, reverse=False)
    upload_speed = parse_bitrate(upload_output)

    # Run download test
    download_output = run_iperf3(server_ip, reverse=True)
    download_speed = parse_bitrate(download_output)
    
    # Prepare the results in JSON format
    results = {
        "download_speed": download_speed if download_speed else "N/A",
        "upload_speed": upload_speed if upload_speed else "N/A"
    }
    
    # Print the results as JSON
    print(json.dumps(results))

if __name__ == "__main__":
    main()

