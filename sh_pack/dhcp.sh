#!/bin/bash

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Install ISC DHCP server if not already installed
#apt-get update
#apt-get install -y isc-dhcp-server vim


#disable NetworkManager
systemctl stop NetworkManager

# Define DHCP configuration file
dhcp_conf="/etc/dhcp/dhcpd.conf"

# Define DHCP server interface
server_interface="enx00e04c362790"  # Change this to match your server's interface

#interface
ip addr add 192.168.1.254/24 dev ${server_interface}
ip link set dev ${server_interface} up

cat <<EOF >$dhcp_conf
option domain-name "dhcp";
option domain-name-servers 140.112.254.4, 140.112.17.1;

default-lease-time 600;
max-lease-time 7200;

subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.20 192.168.1.25;
  option routers 192.168.1.254;
  option broadcast-address 192.168.1.255;
}
EOF

# Configure DHCP server interface
echo "INTERFACE=\"${server_interface}\"" > /etc/default/isc-dhcp-server

# Restart DHCP server
#systemctl stop isc-dhcp-server
systemctl restart isc-dhcp-server

echo "DHCP server has been configured successfully!"




