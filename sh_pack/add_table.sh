ip route add default  proto static scope global table $i \
 	nexthop via ${gates[0]} weight 1 \
 	nexthop via ${gates[1]} weight 1 # need for loop for multiple gates
ip rule add prio $i from 192.168.1.$i table $i
