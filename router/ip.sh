#!/bin/bash
#clean rules
iptables -F && iptables -X && iptables -Z

#defalut drop forward
sudo iptables -P FORWARD ACCEPT
sudo iptables -P INPUT ACCEPT
sudo iptables -P OUTPUT ACCEPT

# forwarding 
echo 1 > /proc/sys/net/ipv4/ip_forward
#iptables -A FORWARD -i enp0s9 -o enp0s3 -p tcp --match multiport --dports 53,80,443,21,20,22,23 -j ACCEPT
#iptables -A FORWARD -i enp0s9 -o enp0s3 -p udp --dport 53 -j ACCEPT
#iptables -A FORWARD -i enp0s9 -o enp0s3 -p icmp -j ACCEPT
#iptables -A FORWARD -i enp0s3 -o enp0s9 -m state --state ESTABLISHED,RELATED -j ACCEPT
#iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE


iptables -A FORWARD -i enp0s9 -o enp0s3 -j ACCEPT
iptables -A FORWARD -i enp0s3 -o enp0s9 -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A POSTROUTING -o enp0s3 -j MASQUERADE


#show
iptables -t filter -L -n  
