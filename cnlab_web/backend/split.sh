#!/bin/bash

# Interface 1
IF1="enxa2fc89257e18"
P1="192.168.131.204"
IP1="192.168.131.227"
T1=1

# Interface 2
IF2="enxa2fbc5bca920"
P2="172.20.10.1"
IP2="172.20.10.5"
T2=2

# Apply commands
ip route add $P1 dev $IF1 src $IP1 table $T1
ip route add default via $P1 table $T1
ip route add $P2 dev $IF2 src $IP2 table $T2
ip route add default via $P2 table $T2
ip route add $P1 dev $IF1 src $IP1
ip route add $P2 dev $IF2 src $IP2
ip rule add from $IP1 table $T1 prio 1
ip rule add from $IP2 table $T2 prio 2
