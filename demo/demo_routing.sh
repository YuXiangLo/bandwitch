#Reference: https://serverfault.com/a/697385

# just refresh to default config for repeated test
systemctl restart NetworkManager
sleep 5


# TODO  may not reliable, replace by text
ips=($(ip -4 a | grep -oP '(?<=inet\s).*(?= brd)'))
int1=$(ip -4 a | grep -oP '(?<=2:\s).*(?=:\s)')
int2=$(ip -4 a | grep -oP '(?<=3:\s).*(?=:\s)')

g1=$(echo $(ip route show default dev $int1)|awk '{print $3}')
g2=$(echo $(ip route show default dev $int2)|awk '{print $3}')

sub1=10.5.0.0/21 # csie5g #"$(echo ${ips[1]} | cut -d'.' -f1-3).0/24"
sub2="$(echo ${ips[0]} | cut -d'.' -f1-3).0/24"

echo $int1
echo $int2
echo $g1
echo $g2
echo $sub1
echo $sub2

# TODO add tables in /etc/iproute2/rt_tables
ip route flush table link1
ip route flush table link2
ip route flush table lb

# set rules in new tables, default for WAN dest
ip route add default via $g1 table link1
ip route add $sub1 dev $int1 table link1
ip route add default via $g2 table link2
ip route add $sub2 dev $int2 table link2

# debug line
echo =======================

ip route add default  proto static scope global table lb \
 nexthop via $g1 weight 1 \
 nexthop via $g2 weight 1

echo =======================

# priority of rules, not so sure why
ip rule add prio 10 table main
ip rule add prio 20 from $sub1 table link1
ip rule add prio 21 from $sub2 table link2
ip rule add prio 100 table lb

# remove old routing setting
ip route del default dev $int1
ip route del default dev $int2

# simply routing
sysctl -wq net.ipv6.conf.all.disable_ipv6=1
sysctl -wq net.ipv6.conf.default.disable_ipv6=1
