#!/bin/bash

for n in {10,20,21,100}; do
	echo $n
	ip rule del prio $n
done

systemctl restart NetworkManager
