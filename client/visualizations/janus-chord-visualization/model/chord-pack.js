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
    // msg.source.spaceId.contextID : ÉMETTEUR DU MESSAGE
    // msg.source.agentId : RÉCÉPTEUR DU MESSAGE

    var mustHandle = (msg.source.spaceId.contextID == this.id);

    if (mustHandle) {
        var msgSenderId = msg.source.agentId;
        var msgSpaceId = msg.source.spaceId.id;

        var chordExists = this.spaces.indexOf(msgSpaceId) != -1;
        if (!chordExists) {
            this.spaces.push(msgSpaceId);
        }

        // when we are not the sender
        if (msgSenderId != this.id) {
            var child = this.findChild(msgSenderId);
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

/**
 * ChordPack
 */
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

ChordPack.prototype.toJSON = function() {
    var obj = {
        id: this.id,
        links: this.links,
        children: this.children.map(function(el) {
            return el.toJSON();
        })
    };

    return obj;
};