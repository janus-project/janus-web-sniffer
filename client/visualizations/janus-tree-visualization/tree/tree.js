Tree = function() {
    this.root = null;
    this.nodeCount = 0;
};

Tree.prototype.getMaxDepth = function() {
    var maxDepth = 0;
    if(this.root != null) {
        var stack = new Array();
        stack.push(this.root);
        while(!stack.length == 0) {
            var node = stack.pop();
            for(var i = 0; i < node.children.length; ++i) {
                var child = node.children[i];
                stack.push(child);
            }
            maxDepth = (node.depth > maxDepth) ? node.depth : maxDepth;
        }
    }
    return maxDepth;
}

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
            var exists = false;
            for(var i = 0; i < parent.children.length; ++i) {
                var child = parent.children[i];
                if(node.name == child.name) {
                    exists = true;
                    break;
                }
            }
            if(!exists) {
                node.depth = parent.depth + 1;
                parent.children.push(node);
            }
            return exists;
        };
                            
        if(this.root.visit(predicat, predicatParams, action, actionParams)) {
            this.nodeCount++;
        }
    }
};
