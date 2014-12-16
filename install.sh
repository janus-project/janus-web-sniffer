#!/bin/bash

# Select packet manager based on distribution used
OS=`uname -s`

if [ "${OS}" = "Linux" ] ; then
        KERNEL=`uname -r`
        if [ -f /etc/redhat-release ] ; then
                DIST='RedHat'
                INSTALL='rpm -i'
        elif [ -f /etc/debian_version ] ; then
                DIST='Debian'
                INSTALL='apt-get install'
        fi
else
	echo "Distribution not supported, please install manually"
	exit 0
fi

# Node installation
if [[ -z `which node` ]]; then
	git clone https://github.com/joyent/node.git
	cd node
	git checkout v0.10.25
	./configure
	make
	sudo make install
	cd ..
fi

# ZeroMQ
if [[ -z `whereis libzmq | cut -d: -f2` ]]; then
	curl http://download.zeromq.org/zeromq-4.0.5.tar.gz | tar -zx
	cd zeromq-4.0.5
	./configure
	make
	sudo make install
	cd ..
fi

# MongoDB
if [[ -z `which mongod` ]]; then
    ${INSTALL} mongodb-org
	sudo mkdir /data/db
fi

# Meteor
curl https://install.meteor.com/ | sh

# NPM Dependencies
mkdir public && cd public
cp ../package.json ./
npm install
rm package.json
cd ..
meteor-npm
