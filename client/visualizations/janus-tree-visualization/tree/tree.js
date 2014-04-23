Tree = function() {
    this.root = null;
    this.nodeCount = 0;
};

Tree.prototype.addNode = function(node, parentName) {
    if(this.root == null) {
        this.root = node;
    } else {
        var predicatParams = parentName;
        var predicat = function(node, nodeName) {
            if(node.name == nodeName) 
                return true;
            return false;
        };
        var actionParams = node;
        var action = function(parent, node) {
            // vérifier unicité des children
            parent.children.push(node);
            return true;
        };
                            
        if(this.root.visit(predicat, predicatParams, action, actionParams)) {
            this.nodeCount++;
        }
    }
};
