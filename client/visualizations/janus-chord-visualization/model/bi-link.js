BiLink = function() {

    this.spaces = {};
    this.children = {};

}

BiLink.prototype.addLink = function(childId, spaceId) {
    if (this.children[spaceId] == null) {
        this.children[spaceId] = [];
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

BiLink.prototype.computeChordMatrix = function() {
    var spaceIds = Object.keys(this.children);
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