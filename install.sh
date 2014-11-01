#!/bin/bash

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
	sudo apt-get update
	sudo apt-get install mongodb
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
