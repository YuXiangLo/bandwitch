# assume main table default only have two wan interfaces'

ips=( $(ip -4 a | grep -oP '(?<=inet\s).*(?= brd)') )

echo "${ips[@]}"

N="${#ips[@]}"

echo $N

ints=()
gates=()
tables=( "ISP1" "ISP2" )
iptables=("filter" "mangle" "nat")

#show all tables
#ip route show table all |awk '{print $6}'|sort|uniq

for t in "${tables[@]}"; do
	echo "ip route flush table $t"
	ip route flush table $t
done

for  (( i=2; i<=$(( $N+1 )); i++  )); do
	int=$(ip -4 a | grep -oP "(?<=$i:\s).*(?=:\s)")
	ints+=( $int )
	gates+=( $(ip route show default dev ${int} |awk '{print $3}') )
	echo "ip route add $(ip route show dev ${int}| grep -oP '^default.*(?= metric)') table ${tables[$((i-2))]}"
	ip route add $(ip route show dev ${int}| grep -oP '^default.*(?= metric)') table ${tables[$((i-2))]}

done

echo "${ints[@]}"
echo "${gates[@]}"
	

ip route show table main | grep -Ev '^default' \
   | while read ROUTE ; do
	for t in "${tables[@]}"; do
		echo "ip route add $ROUTE table $t"
		ip route add $ROUTE table $t
	done
done

ip rule add fwmark 10 table ISP1
ip rule add fwmark 20 table ISP2

echo "======================================"

for t in "${iptables[@]}"; do
	iptables -t $t -F && iptables -t $t -X 
done
iptables -Z

iptables -t mangle -A PREROUTING -j CONNMARK --restore-mark
iptables -t mangle -A PREROUTING -m mark ! --mark 0 -j ACCEPT
iptables -t mangle -A PREROUTING -j MARK --set-mark 10
iptables -t mangle -A PREROUTING -m statistic --mode random --probability 0.5 -j MARK --set-mark 20
iptables -t mangle -A PREROUTING -j CONNMARK --save-mark

for int in "${ints[@]}"; do
	iptables -t nat -A POSTROUTING -o $int -j MASQUERADE
done

for t in "${iptables[@]}"; do
	echo "==========================================="
	echo "iptables -t $t -L -n"
	iptables -t $t -L -n
done

#ip route show table main | grep -E '^default' \
#   | while read ROUTE ; do
#	echo $ROUTE
#     echo "ip route add default via 192.168.1.2 table $t"
#done




