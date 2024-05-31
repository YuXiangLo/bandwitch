DEVICE=enx00e04c362790

TOTAL_BANDWIDTH="2.0gbit"

VIDEO_CLASS="1:2"
GAME_CLASS="1:3"

VIDEO_DSCP="0x24"
GAME_DSCP="0x32"


initialize_entry(){
	# delete the current qdisc
	tc qdisc del dev $DEVICE root

	# add a new qdisc
	tc qdisc add dev $DEVICE root handle 1: htb default 4


	tclass(){
		tc class add dev $DEVICE parent 1:0 classid $1 htb rate $2 ceil 10mbit burst 15k
	}

	tclass $VIDEO_CLASS 10mbit
	tclass $GAME_CLASS 10mbit
}


addfilter(){
	tc filter add dev $DEVICE protocol ip parent 1: prio $1 u32 match ip dsfield $2 0xfc classid $3
} 

delfilter(){
	tc filter del dev $DEVICE protocol ip parent 1: prio $1 u32 match ip dsfield $2 0xfc classid $3
}

addVideoFilter(){
	addfilter 1  $VIDEO_DSCP $VIDEO_CLASS
}
addGameFilter(){
	addfilter 2 $GAME_DSCP $GAME_CLASS
}

delVideoFilter(){
	delfilter 1 $VIDEO_DSCP $VIDEO_CLASS
}
delGameFilter(){
	delfilter 2 $GAME_DSCP $GAME_CLASS
}


case "$1" in
    -av)
        addVideoFilter
        ;;
    -ag)
        addGameFilter
        ;;
    -dv)
        delVideoFilter
        ;;
    -dg)
        delGameFilter
        ;;
    *)
        initialize_entry
        ;;
esac
