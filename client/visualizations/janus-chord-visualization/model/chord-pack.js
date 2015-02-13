/**
 * ChordPack represents a context with it's holonic hierarchy.
 * It is used as input to d3.layout.pack() to produce a "bubble" diagram
 */
ChordPack = function(contextId) {
    this.id = contextId;

    // Chords array of spaceId
    this.spaces = [];

    // Bubbles array of ChordPack
    this.children = [];

    this.links = new BiLink();
};

/**
 * Try to handle the event given to us
 * in case we can not handle, give to children
 *
 * return handled: bool true if handled else false
 */
ChordPack.prototype.dispatchEvent = function(headers, msg) {
    // console.log('dispatchEvent: ' + msg.source.agentId + ' | ' + msg.source.spaceId.id);
    // msg.source.spaceId.contextID : parent
    // msg.source.agentId : child

    var mustHandle = (msg.source.spaceId.contextID == this.id);

    if (mustHandle) {
        var msgSenderId = msg.source.agentId;
        var msgSpaceId = msg.source.spaceId.id;

        var chordExists = this.spaces.indexOf(msgSpaceId) != -1;
        if (!chordExists) {
            this.spaces.push(msgSpaceId);
        }

        // if the message was sent by an agent that is not this chord-pack
        if (msgSenderId != this.id) {
            // we try to find the sender in this agent's children
            var child = this.findChild(msgSenderId);
            // if we don't find it, we create it
            if (child == null) {
                child = new ChordPack(msgSenderId);
                this.addChild(child);
            }

            this.links.addLink(msgSenderId, msgSpaceId);
        }

        return true;
    }
    else {
        // hand over the event to children
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].dispatchEvent(headers, msg)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * Use this function to add an existing chordPack
 * for example when switching the root chordPack
 */
ChordPack.prototype.attachChordPack = function(chordPack, msgSpaceId) {
    var chordExists = this.spaces.indexOf(msgSpaceId) != -1;
    if (!chordExists) {
        this.spaces.push(msgSpaceId);
    }

    this.addChild(chordPack);

    this.links.addLink(chordPack.id, msgSpaceId);
};

ChordPack.prototype.addChild = function(child) {
    this.children.push(child);
};

/**
 * Find a child corresponding to the id
 * return ChordPack
 */
ChordPack.prototype.findChild = function(contextId) {
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].id == contextId) {
            return this.children[i];
        }
    }
    return null;
};

ChordPack.prototype.removeChild = function(child) {
    this.children = this.children.filter(function(el) {
        return el.id != child.id;
    });
};
