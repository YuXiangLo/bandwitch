#!/bin/bash

# Define interfaces
ETH_INTERFACE="enxaa817ed7ad0c"
WIFI_INTERFACE="wlx2887ba25c83d"

# Get IP addresses
ETH_IP=$(ip -4 addr show $ETH_INTERFACE | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
WIFI_IP=$(ip -4 addr show $WIFI_INTERFACE | grep -oP '(?<=inet\s)\d+(\.\d+){3}')

# Add default routes with weights
#ip route add default via $ETH_IP dev $ETH_INTERFACE table 2
#ip route add default via $WIFI_IP dev $WIFI_INTERFACE table 1

## Define routing rules with weights
#ip rule add from $ETH_IP table 2 priority 200
#ip rule add from $WIFI_IP table 1 priority 100

# Set up weighted load balancing
ip route add default \
    nexthop via $ETH_IP dev $ETH_INTERFACE weight 1 \
    nexthop via $WIFI_IP dev $WIFI_INTERFACE weight 10

echo "Weighted routing setup completed."

