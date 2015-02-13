Janus web sniffer Demo
======================

Requirements
------------

To use the sniffer you will need.

* Meteor (http://www.meteor.com)
* Node.js (http://nodejs.org/)
* Npm (https://github.com/npm/npm)
* ZeroMQ-node (http://zeromq.org/bindings:node-js and https://github.com/JustinTulloss/zeromq.node)
* MongoDB
* jQuery

All these dependencies can be installed as explain below.

Installation
------------

To install the service, run the following script (supports Debian-like 
distribution and rpm-based distribution)
```bash
./install.sh
```

Launch
------

Don't forget to set the correct port to listen in
server/janus-visualisation-server.js, start mongodb demon and type
```bash
./start.sh
```

### If your are behind a proxy
```bash
$ npm config set proxy http://proxy.company.com:8080
$ npm config set https-proxy http://proxy.company.com:8080
```
