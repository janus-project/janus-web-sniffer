function BiLink () {
    
    var chords = {};
    var children = {};
    
}

BiLink.prototype.addLink = function (child, chord) {
    if (children[chord] == null)
        children[chord] = [];
    if (chords[child] == null)
        chords[child] = [];
    
    children[chord].push(child);
    chords[child].push(chord);
}

BiLink.prototype.getChildren = function (chord) {
    return children[chord];
}

BiLink.prototype.getChords = function (child) {
    return chords[child];
}