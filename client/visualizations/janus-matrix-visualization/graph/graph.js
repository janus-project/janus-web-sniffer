Graph = function() {
    this.links = [];
    this.nodes = [];
};

Graph.prototype.addNode = function(node) {
    for(var i = 0; i < this.nodes.length; ++i) {
        var n = this.nodes[i];
        if(n.name == node.name) {
            return i;
        }
    }

    this.nodes.push(node);
    return this.nodes.length - 1;
};

Graph.prototype.addLink = function(link) {
    var exists = false;
    for(var i = 0; i < this.links.length; ++i) {
        var l = this.links[i];
        if(l.target == link.target && l.source == link.source) {
            l.value += link.value;
            exists = true;
            break;
        }
    }
    if(!exists) {
        this.links.push(link);
    }
};
