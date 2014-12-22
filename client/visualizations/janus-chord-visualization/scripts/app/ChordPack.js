function ChordPack(contextId) {
    this.id = contextId;
    
    // Chords array of spaceId
    this.chords = [];
    
    // Bubbles array of ChordPack
    this.children = [];
    
    this.links = new BiLink();
}

/**
 * Try to handle the event given to us
 * in case we can not handle, give to children
 *
 * return handled: bool true if handled else false
 */
ChordPack.prototype.dispatchEvent = function(headers, msg) {
    
    // msg.source.spaceId.contextID : ÉMETTEUR DU MESSAGE
    // msg.source.agentId : RÉCÉPTEUR DU MESSAGE
    
    var mustHandle = (msg.source.spaceId.contextID == this.id);
    
    if (mustHandle) {
        var childId = msg.source.agentId;
        var spaceId = msg.source.spaceId.id;
        
        var chordExists = this.chords.indexOf(spaceId) != -1;
        if(!chordExists) {
            this.chords.push(spaceId);
        }
        
        var child = findChild(childId);
        if(child == null) {
            child = addChild(childId);
        }
        
        this.links.addLink(child, spaceId);
        
        return true;
    } else {
        // hand over the event to children
        for (var i = 0; i < children.length; i++) {
            if (children[i].dispatchEvent(headers, msg)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * child: ChordPack
 * return ChordPack
 */
ChordPack.prototype.addChild = function (childContextId, spaceId) {
    var child = new ChordPack(childContextId);
    
    this.children.push(child);
    
    return child;
}

/**
 * Find a child corresponding to the id
 * return ChordPack
 */
ChordPack.prototype.findChild = function (contextId) {
    for (var i = 0; i < this.children.length; i++) {
        if(this.children[i].id == contextId) {
            return this.children[i];
        }
    }
    return null;
}

ChordPack.prototype.removeChild = function (child) {
    this.children = this.children.filter(function (el) {
        return el.id != child.id;
    });
}

ChordPack.prototype.update = function () {
    
}