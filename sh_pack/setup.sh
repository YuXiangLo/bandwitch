sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv4.fib_multipath_hash_policy=1
ip a add dev enp0s9 192.168.1.254/24
ip route del default via 192.168.1.1 2>/dev/null
systemctl restart NetworkManager
sleep 3
systemctl stop NetworkManager
# mv /home/routerserver/rt_tables /etc/iproute2/rt_tables

# assume main table default only have two wan interfaces'
ips=( $(ip -4 a | grep -oP '(?<=inet\s).*(?= brd)') )
subs=()
for ip in ${ips[@]}; do
	subs+=( $(ipcalc -n $ip | awk 'NR==5 {print $2}') )
done

N="${#ips[@]}"

echo $N

ints=()
gates=()
# tables=( "link1" "link2" )
iptables=("filter" "mangle" "nat")

#show all tables
#ip route show table all |awk '{print $6}'|sort|uniq

#for t in "${tables[@]}"; do
#	echo "ip route flush table $t"
#	ip route flush table $t
#done

ip rule flush
# preserve default
ip rule add prio 32766 from all lookup main # for local
ip rule add prio 32767 from all lookup default

for  (( i=2; i<=$(( $N+1 )); i++  )); do
	int=$(ip -4 a | grep -oP "(?<=$i:\s).*(?=:\s)")
	ints+=( $int )
	gates+=( $(ip route show default dev ${int} |awk '{print $3}') )
	#echo "ip route add $(ip route show dev ${int}| head -n 1) table ${tables[$((i-2))]}"
	#ip route flush table ${tables[$((i-2))]}
	#ip route add $(ip route show dev ${int}| head -n 1) table ${tables[$((i-2))]}

done

#for  (( i=1; i<=$N; i++  )); do
#	echo "ip rule add prio $i from ${subs[$((i-1))]} table ${tables[$((i-1))]}"
#	ip rule add prio $i from ${subs[$((i-1))]} table ${tables[$((i-1))]}
#done

# no need if split access first
#ip route show table main | grep -Ev '^default' \
#   | while read ROUTE ; do
#	for t in "${tables[@]}"; do
#		echo "ip route add $ROUTE table $t"
#		ip route add $ROUTE table $t
#	done
#done

echo "ips: ${ips[@]}"
echo "subs: ${subs[@]}" #maynot needed
echo "ints: ${ints[@]}"
echo "gates: ${gates[@]}"
	

echo "======================================"

# clean iptables
for t in "${iptables[@]}"; do
	iptables -t $t -F && iptables -t $t -X 
done
iptables -Z

for int in "${ints[@]}"; do
	iptables -t nat -A POSTROUTING -o $int -j MASQUERADE
done

for i in {20..25}; do
    #iptables -t mangle -A PREROUTING -s 192.168.1.$i -j MARK --set-mark $i
    ip route flush table $i
    ip route add default  proto static scope global table $i \
 	nexthop via ${gates[0]} weight 1 \
 	nexthop via ${gates[1]} weight 1 # need for loop for multiple gates
    ip rule add prio $i from 192.168.1.$i table $i
done

ip route add 192.168.1.0/24 dev enp0s9


#echo "====="
#i=254
#ip route flush table $i
#echo "ip route add default  proto static scope global table $i nexthop via ${gates[0]} weight 1 nexthop via ${gates[1]} weight 1"
#ip route add default proto static scope global table $i nexthop via ${gates[1]} weight 1
#ip rule add prio $i from 192.168.1.$i table $i

#iptables -t mangle -A PREROUTING -j CONNMARK --restore-mark
#iptables -t mangle -A PREROUTING -m mark ! --mark 0 -j ACCEPT
#iptables -t mangle -A PREROUTING -j MARK --set-mark 10
#iptables -t mangle -A PREROUTING -m statistic --mode random --probability 0.5 -j MARK --set-mark 20
#iptables -t mangle -A PREROUTING -j CONNMARK --save-mark


#for t in "${iptables[@]}"; do
#	echo "==========================================="
#	echo "iptables -t $t -L -n"
#	iptables -t $t -L -n
#done

#ip route show table main | grep -E '^default' \
#   | while read ROUTE ; do
#	echo $ROUTE
#     echo "ip route add default via 192.168.1.2 table $t"
#done




