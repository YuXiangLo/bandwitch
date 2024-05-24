sysctl -w net.ipv4.ip_forward=1
sysctl -w net.ipv4.fib_multipath_hash_policy=1
ip route del default via 192.168.1.1 2>/dev/null

# reset gateway, may cause error
systemctl restart NetworkManager
sleep 3
systemctl stop NetworkManager

ips=( $(ip -4 a | grep -oP '(?<=inet\s).*(?= brd)') )
subs=()
for ip in ${ips[@]}; do
	subs+=( $(ipcalc -n $ip | awk 'NR==5 {print $2}') )
done

N="${#ips[@]}"

echo $N

ints=()
gates=()
iptables=("filter" "mangle" "nat")



ip rule flush
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



echo "ips: ${ips[@]}"
echo "subs: ${subs[@]}" #maynot needed
echo "ints: ${ints[@]}"
echo "gates: ${gates[@]}"
	

echo "======================================"

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
