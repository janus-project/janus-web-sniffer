var Interactions = new Meteor.Collection("janus_event_dispatches");
Interactions.remove({});

function debuildFilterableHeader(header) {
    return header.slice(4, header.length);
}

function handle_event_envelope(contextID, spaceIDL, spaceID, scopeL, scope, headersL, headers, bodyL, body) {
    console.log(debuildFilterableHeader(contextID).toString('utf8'));
    console.log(spaceIDL.toString('utf8'));
    console.log(spaceID.toString('utf8'));
    console.log(scopeL.toString('utf8'));
    console.log(scope.toString('utf8'));
    console.log(headersL.toString('utf8'));
    console.log(headers.toString('utf8'));
    console.log(bodyL.toString('utf8'));
    console.log(body.toString('utf8'));

    Interactions.insert({
        contextId: debuildFilterableHeader(contextID).toString('utf8'), 
        spaceIdL: spaceIDL.toString('utf8'), 
        spaceId: spaceID.toString('utf8'), 
        scopeL: scopeL.toString('utf8'), 
        scope: scope.toString('utf8'), 
        headersL:headersL.toString('utf8'), 
        headers:headers.toString('utf8'), 
        bodyL: bodyL.toString('utf8'),
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
