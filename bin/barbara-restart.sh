#!/bin/bash

if [ ! -d "$BARBARA_HOME" ]
then
	echo "Please set BARBARA_HOME environmental variable"

	exit 1
fi

if [ ! -f $BARBARA_HOME/barbara/config/`hostname`.json ]
then
	echo "No pm2 config file found at $BARBARA_HOME/barbara/config/`hostname`.json"

	exit 2
fi

echo "Using BARBARA_HOME = $BARBARA_HOME"
echo "Shutting down pm2"

pm2 kill

echo "Starting pm2"
cd $BARBARA_HOME
pm2 start $BARBARA_HOME/barbara/config/`hostname`.json
