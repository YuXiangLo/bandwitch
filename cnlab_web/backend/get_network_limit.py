import speedtest
import json

def measure_speed():
    st = speedtest.Speedtest(secure=True)
    st.get_best_server()
    
    download_speed = st.download() / 1_000_000  # Convert from bits/s to Mbps
    upload_speed = st.upload() / 1_000_000  # Convert from bits/s to Mbps

    return {'download_speed': download_speed, 'upload_speed': upload_speed}

if __name__ == "__main__":
    speeds = measure_speed()
    print(json.dumps(speeds))

