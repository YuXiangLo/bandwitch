#!/bin/bash

SERVER_IP="140.112.30.186"
DURATION=1
NIC="wlx2887ba25c83d"

# Run iperf3 for upload test
UPLOAD_OUTPUT=$(iperf3 -t $DURATION -c $SERVER_IP -i  $NIC)
UPLOAD_SPEED=$(echo "$UPLOAD_OUTPUT" | grep -oP '\d+\.\d+ Mbits/sec' | head -1 | grep -oP '\d+\.\d+')

# Run iperf3 for download test
DOWNLOAD_OUTPUT=$(iperf3 -t $DURATION -c $SERVER_IP -R)
DOWNLOAD_SPEED=$(echo "$DOWNLOAD_OUTPUT" | grep -oP '\d+\.\d+ Mbits/sec' | head -1 | grep -oP '\d+\.\d+')

# Create JSON output
JSON_OUTPUT=$(jq -n --arg upload "$UPLOAD_SPEED" --arg download "$DOWNLOAD_SPEED" \
                '{upload_speed: $upload, download_speed: $download}')

# Print JSON output
echo "$JSON_OUTPUT"
