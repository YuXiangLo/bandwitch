#!/bin/bash
ip route add default via 192.168.131.204 dev enx9a328dfbf935 metric 1 
ip route add default via 172.20.10.1 dev enxa2fbc5bca920 metric 10
