BiLink = function () {
    
    this.spaces = {};
    this.children = {};
    
}

BiLink.prototype.addLink = function (childId, spaceId) {
    if (this.children[spaceId] == null) {
        this.children[spaceId] = [];
    }
    if (this.spaces[childId] == null) {
        this.spaces[childId] = [];
    }
    
    this.children[spaceId].push(childId);
    this.spaces[childId].push(spaceId);
}

BiLink.prototype.getChildren = function (spaceId) {
    return this.children[spaceId];
}

BiLink.prototype.getSpaces = function (childId) {
    return this.spaces[childId];
}