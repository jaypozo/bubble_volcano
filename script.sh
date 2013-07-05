#!/bin/bash
echo "Starting script" | mail -s "Volcano start" jay@jaymatter.com
nohup python /home/pi/src/bubble_volcano/relay_server/server.py &
nohup node /home/pi/src/bubble_volcano/index.js &
