# Define device name variable
DEVICE=enx00e04c362790

# Define the total bandwidth allowed on the device
TOTAL_BANDWIDTH=2.0gbit

# Define the acceptable burst
BURST=30k

# Define class IDs
TC_CLASS_CS6="1:6"
TC_CLASS_CS7="1:7"
TC_CLASS_EF="1:5"
TC_CLASS_AF4="1:4"
TC_CLASS_AF3="1:3"
TC_CLASS_AF2="1:2"
TC_CLASS_AF1="1:1"
TC_CLASS_BE="1:9"

# Delete the current qdisc
tc qdisc del dev $DEVICE root

# Create traffic control qdisc
tc qdisc add dev $DEVICE root handle 1: htb default 9

# Define total bandwidth
tc class add dev $DEVICE parent 1: classid 1:10 htb rate $TOTAL_BANDWIDTH burst $BURST

# Define traffic control classes
tclass() {
    tc class add dev $DEVICE parent 1:10 classid $1 htb rate $2 ceil $3 burst $BURST
}

# Define rate and ceil for each class
CS6_RATE=100mbit
CS6_CEIL=500mbit
CS7_RATE=100mbit
CS7_CEIL=500mbit
EF_RATE=300mbit
EF_CEIL=500mbit
AF4_RATE=300mbit
AF4_CEIL=500mbit
AF3_RATE=200mbit
AF3_CEIL=400mbit
AF2_RATE=200mbit
AF2_CEIL=400mbit
AF1_RATE=200mbit
AF1_CEIL=400mbit
BE_RATE=1mbit
BE_CEIL=10mbit

tclass $TC_CLASS_CS6 $CS6_RATE $CS6_CEIL 
tclass $TC_CLASS_CS7 $CS7_RATE $CS7_CEIL
tclass $TC_CLASS_EF $EF_RATE $EF_CEIL
tclass $TC_CLASS_AF4 $AF4_RATE $AF4_CEIL
tclass $TC_CLASS_AF3 $AF3_RATE $AF3_CEIL
tclass $TC_CLASS_AF2 $AF2_RATE $AF2_CEIL
tclass $TC_CLASS_AF1 $AF1_RATE $AF1_CEIL
tclass $TC_CLASS_BE $BE_RATE $BE_CEIL

# Define traffic control filters
tcfilter() {
    tc filter add dev $DEVICE protocol ip parent 1: prio $1 u32 match ip dsfield $2 0xfc classid $3
}
# CS6 and CS7
tcfilter 1 0x30 $TC_CLASS_CS6
tcfilter 1 0x38 $TC_CLASS_CS7
# EF (Expedited Forwarding)
tcfilter 2 0x2e $TC_CLASS_EF
# AF4
tcfilter 3 0x22 $TC_CLASS_AF4
# AF3
tcfilter 4 0x1a $TC_CLASS_AF3
# AF2
tcfilter 5 0x12 $TC_CLASS_AF2
# AF1
tcfilter 6 0x0a $TC_CLASS_AF1
# Default (BE)
tcfilter 7 0x00 $TC_CLASS_BE

