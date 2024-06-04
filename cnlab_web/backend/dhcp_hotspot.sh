#!/bin/bash

# Check if running as root
if [[ $EUID -ne 0 ]]; then
  echo "This script must be run as root"
  exit 1
fi

# Define DHCP configuration file
dhcp_conf="/etc/dhcp/dhcpd.conf"

# Define DHCP server interface
server_interface="wlo1" # Change this to match your server's interface

systemctl stop NetworkManager

#interface
ip addr add 192.168.1.254/24 dev ${server_interface}
ip link set dev ${server_interface} up
socat UDP-LISTEN:53,fork,reuseaddr,bind=192.168.1.254 UDP:127.0.0.53:53 &

cat <<EOF >$dhcp_conf
option domain-name "router.io";
option domain-name-servers 192.168.1.254;
default-lease-time 600;
max-lease-time 7200;

subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.20 192.168.1.29;
  option routers 192.168.1.254;
  option broadcast-address 192.168.1.255;
}
EOF

# Configure DHCP server interface
echo "INTERFACE=\"${server_interface}\"" >/etc/default/isc-dhcp-server

# Restart DHCP server
#systemctl stop isc-dhcp-server

echo "DHCP server has been configured successfully!"

hostapd /etc/hostapd/hostapd.conf &

systemctl restart isc-dhcp-server
