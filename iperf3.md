## client

```sh
iperf3 -t 5 -c 140.112.30.186 -i enp0s3 -R && iperf3 -t 5 -c 140.112.30.186 -i enp0s3
```

output
```
Connecting to host 140.112.30.186, port 5201
Reverse mode, remote host 140.112.30.186 is sending
[  5] local 10.0.2.15 port 59432 connected to 140.112.30.186 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-5.00   sec   240 MBytes   403 Mbits/sec
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-5.00   sec   241 MBytes   404 Mbits/sec  1769             sender
[  5]   0.00-5.00   sec   240 MBytes   403 Mbits/sec                  receiver

iperf Done.
Connecting to host 140.112.30.186, port 5201
[  5] local 10.0.2.15 port 59444 connected to 140.112.30.186 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-5.00   sec   131 MBytes   219 Mbits/sec    0   77.0 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-5.00   sec   131 MBytes   219 Mbits/sec    0             sender
[  5]   0.00-5.01   sec   130 MBytes   218 Mbits/sec                  receiver
```

## server

```sh
iperf3 -s -i net0.30@net0
```
