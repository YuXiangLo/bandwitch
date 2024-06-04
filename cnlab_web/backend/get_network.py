import psutil
import json
import sys
import time

def get_network_rates(interface, interval=1):
    # Get initial network stats
    initial_stats = psutil.net_io_counters(pernic=True).get(interface, None)
    if initial_stats is None:
        return None

    # Sleep for the specified interval
    time.sleep(interval)

    # Get network stats again
    final_stats = psutil.net_io_counters(pernic=True).get(interface, None)
    if final_stats is None:
        return None

    # Calculate the rates in KB/s
    bytes_sent_per_sec = (final_stats.bytes_sent - initial_stats.bytes_sent) / interval / 1024
    bytes_recv_per_sec = (final_stats.bytes_recv - initial_stats.bytes_recv) / interval / 1024

    return {"bytes_sent_per_sec": round(bytes_sent_per_sec, 2),
            "bytes_recv_per_sec": round(bytes_recv_per_sec, 2)}

def main():
    interfaces = psutil.net_io_counters(pernic=True).keys()
    network_info = {"type": "network", "data": {}}

    for interface in interfaces:
        network_rates = get_network_rates(interface)
        if network_rates:
            network_info["data"][interface] = network_rates
        else:
            sys.stderr.write(f"Warning: Interface {interface} not found or unable to retrieve data.\n")

    # Print all network rate information as JSON
    if network_info["data"]:
        info = json.dumps(network_info)
        sys.stdout.write(info)
    else:
        sys.stderr.write("Error: No valid network interfaces found.\n")

if __name__ == "__main__":
    main()

