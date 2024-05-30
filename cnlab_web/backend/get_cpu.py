import psutil
import json
import sys

def get_cpu_usage():
    cpu_usage = psutil.cpu_percent(interval=1, percpu=True)
    cpu_data = {f"core_{i}": usage for i, usage in enumerate(cpu_usage)}
    # Print JSON string to stdout to be captured by Node.js exec
    sys.stdout.write(json.dumps({"type": "cpu", "data": cpu_data}))

if __name__ == "__main__":
    get_cpu_usage()

