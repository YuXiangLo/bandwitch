#!/bin/bash

SERVER_IP="140.112.30.186"
DURATION=1
NIC="wlx2887ba25c83d"

# Run iperf3 for upload and download tests and capture the output
UPLOAD_RESULT=$(iperf3 -J -t $DURATION -c $SERVER_IP)
sleep 1
DOWNLOAD_RESULT=$(iperf3 -J -t $DURATION -c $SERVER_IP -R)

# Extract the upload speed (bits_per_second) from the upload result
UPLOAD_SPEED=$(echo $UPLOAD_RESULT | jq '.end.sum_sent.bits_per_second')

# Extract the download speed (bits_per_second) from the download result
DOWNLOAD_SPEED=$(echo $DOWNLOAD_RESULT | jq '.end.sum_received.bits_per_second')

# Convert speeds from bits per second to megabits per second
UPLOAD_SPEED_MBPS=$(echo "scale=2; $UPLOAD_SPEED / 1000000" | bc)
DOWNLOAD_SPEED_MBPS=$(echo "scale=2; $DOWNLOAD_SPEED / 1000000" | bc)

# Pack the speeds into a JSON object
RESULT_JSON=$(jq -n --arg up "$UPLOAD_SPEED_MBPS" --arg down "$DOWNLOAD_SPEED_MBPS" '{download_speed: $down, upload_speed: $up}')

# Print the JSON result
echo $RESULT_JSON > speed.json

