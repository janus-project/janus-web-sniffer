var Interactions = new Meteor.Collection("janus_event_dispatches");
//Interactions.remove({});

function handle_event_envelope(contextID, spaceID, scope, headers,body) {
    console.log(contextID.toString('utf8'));
    console.log(spaceID.toString('utf8'));
    console.log(scope.toString('utf8'));
    console.log(headers.toString('utf8'));
    console.log(body.toString('utf8'));

    Interactions.insert({
        contextId: contextID.toString('utf8'), 
        spaceId: spaceID.toString('utf8'), 
        scope: scope.toString('utf8'), 
        headers:headers.toString('utf8'), 
        body: body.toString('utf8'),
        created_at: new Date()
    });
}

bound_handle_message = Meteor.bindEnvironment(handle_event_envelope, function(e) {
    console.log("exception! " + e); 
});

Meteor.startup(function () {
    var janus_uri = "tcp://127.0.0.1:19118";

    var zmq = Meteor.require("zmq");
    var sock = zmq.socket("sub");

    sock.connect(janus_uri);
    sock.subscribe('');

    console.log('Connected to '+janus_uri);
    
    sock.on('message', bound_handle_message);
});
