BiLink = function() {

    this.spaces = {};
    this.children = {};

    this.orderedSpaces = d3.set();
}

BiLink.prototype.addLink = function(childId, spaceId) {
    if (this.children[spaceId] == null) {
        this.children[spaceId] = [];

        this.orderedSpaces.add(spaceId);
    }
    if (this.spaces[childId] == null) {
        this.spaces[childId] = [];
    }

    this.children[spaceId].push(childId);
    this.spaces[childId].push(spaceId);
}

BiLink.prototype.getChildrenBySpaceId = function(spaceId) {
    return this.children[spaceId];
}

BiLink.prototype.getSpacesByChildId = function(childId) {
    return this.spaces[childId];
}

BiLink.prototype.getAllSpaces = function() {
    return this.orderedSpaces.values();
}

// BiLink.prototype.getAllChildren = function() {
//     return Object.keys(this.spaces);
// }

BiLink.prototype.computeChordMatrix = function() {
    var spaceIds = this.orderedSpaces.values();
    var size = spaceIds.length;

    var matrix = new Array(size);
    for (var i = 0; i < size; i++) {
        matrix[i] = new Array(size);

        for (var j = 0; j < size; j++) {
            matrix[i][j] = (i == j) ? this.children[spaceIds[i]].length : 0;
        }
    }

    return matrix;
}