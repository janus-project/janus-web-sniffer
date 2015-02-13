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

###How to be sure you're listening the right port
We use the zmq plugin to listen a ZeroMQ socket, but when you launch an agent don't forget to specify on the command line in the launch configuration the following JVM option
```
-Dnetwork.pub.uri=tcp://10.20.2.144:29118
```
And be sure, it matches the port definition specified in server/janus-visualization-server.js
```
Meteor.startup(function () {
    var janus_uri = "tcp://10.20.2.144:29118";

    var zmq = Meteor.require("zmq");
    var sock = zmq.socket("sub");

    sock.connect(janus_uri);
    sock.subscribe('');

    console.log('Connected to '+janus_uri);
    
    sock.on('message', bound_handle_message);
});
```
If both match, you will able to sniff any trame on the socket and thus displaying the corresponding information on the various d3js visualizations.
Be sure you do not activate the encryption over the socket, the zmq plugin is unable to decrypt it.




