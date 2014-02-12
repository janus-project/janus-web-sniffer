Janus web sniffer Demo
=================

Requirements
------------

To use the sniffer you will need.

* Meteor (http://www.meteor.com)
* Node.js (http://nodejs.org/)
* Npm (https://github.com/npm/npm)
* ZeroMQ-node (http://zeromq.org/bindings:node-js and https://github.com/JustinTulloss/zeromq.node)
* MongoDB


Install Node.js, Npm and ZeroMQ-node.js
---------------------------------------

The following intructions can be used in Ubuntu to setup the necessary dependencies.

### Node.js

```bash
$ sudo apt-get update
$ sudo apt-get install git-core curl build-essential openssl libssl-dev
$ git clone https://github.com/joyent/node.git
$ cd node
$ git tag # Gives you a list of released versions
$ git checkout v0.10.25
$ ./configure
$ make
$ sudo make install
```

### Npm

```bash
$ curl https://npmjs.org/install.sh | sudo sh
```

###Install ZeroMQ Libs

Download sources from http://zeromq.org/intro:get-the-software

```bash
$ cd zeromq-3.2.4/
$ ./configure && make
$ sudo make install
```

### ZeroMQ-node

```bash
$ npm install zmq
$ sudo ldconfig
```


### Npm In meteor

https://github.com/arunoda/meteor-npm

```bash
$ npm install -g meteor-npm #single time operation
$ meteor-npm #type inside your project
```


### If your are behide a proxy
```bash
$ npm config set proxy http://proxy.company.com:8080
$ npm config set https-proxy http://proxy.company.com:8080
```
