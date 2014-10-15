Graph = function() {
    this.links = [];
    this.nodes = [];
};

/**
 * Adds a node in the graph
 */ 
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

/**
 * Adds a link in the graph
 */
Graph.prototype.addLink = function(link) {
    var exists = false;
    for(var i = 0; i < this.links.length; ++i) {
        var l = this.links[i];
        if(l.target == link.target && l.source == link.source) {
            l.value += link.value;
            return l;
        }
    }
    this.links.push(link);
    return link;
};
