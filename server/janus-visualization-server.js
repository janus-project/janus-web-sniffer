var Interactions = new Meteor.Collection("janus_event_dispatches");
var InteractionsTable = new Meteor.Collection("janus_event_visualization");
//Interactions.remove({});
//InteractionsTable.remove({});

function debuildFilterableHeader(header) {
    return header.slice(4, header.length);
}

function handle_event_envelope(contextID, spaceIDL, spaceID, scopeL, scope, headersL, headers, bodyL, body) {
    var messages = {};

    messages['contextId'] = debuildFilterableHeader(contextID).toString('utf8');
    messages['spaceId'] = spaceID.toString('utf8');
    messages['scope'] = scope.toString('utf8');
    messages['headers'] = headers.toString('utf8');
    messages['body'] = body.toString('utf8');

    Interactions.insert({
        contextId:  debuildFilterableHeader(contextID).toString('utf8'), 
        spaceIdL:   spaceIDL.toString('utf8'), 
        spaceId:    spaceID.toString('utf8'), 
        scopeL:     scopeL.toString('utf8'), 
        scope:      scope.toString('utf8'), 
        headersL:   headersL.toString('utf8'), 
        headers:    headers.toString('utf8'), 
        bodyL:      bodyL.toString('utf8'),
        body:       body.toString('utf8'),
        created_at: new Date()
    });

    for(var key in messages) {
        if(key == 'contextId' || key == 'spaceId')
            continue;

        var msg = messages[key];

        // small hack to have clean messages for eval()
        msg = msg.replace(/[\n\r\t]/g, '');
        msg = msg.replace(/[{]/g, '[{');
        msg = msg.replace(/[}]/g, '}]');

        console.log(msg);

        try {
            msg = JSON.convertJsonToTable(eval(msg));
            messages[key] = msg;
        } catch(err) {
            console.log(err);
            console.log('Error while parsing ' + key + ' ' + msg);
        }
    }

    InteractionsTable.insert({
        contextId:  messages['contextId'], 
        spaceId:    messages['spaceId'],
        scope:      messages['scope'],
        headers:    messages['headers'],
        body:       messages['body'],
        created_at: new Date()
    });
}

bound_handle_message = Meteor.bindEnvironment(handle_event_envelope, function(e) {
    console.log("exception! " + e); 
});

Meteor.startup(function () {
    var janus_uri = "tcp://172.18.4.141:19118";

    var zmq = Meteor.require("zmq");
    var sock = zmq.socket("sub");

    sock.connect(janus_uri);
    sock.subscribe('');

    console.log('Connected to '+janus_uri);
    
    sock.on('message', bound_handle_message);
});
