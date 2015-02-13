Tree = function() {
    this.root = null;
    this.nodeCount = 0;
};

/**
 * Gets the depth of the tree
 *  return the depth
 */
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

/**
 * Adds a node in the treeN
 *  node : Node is the node to add
 *  parentName : String is the name of the parent to attach node
 */ 
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

Tree.prototype.addMapNode = function(node, parentName) {
    if(this.root == null) {
        /* the root must no be a context nor an id */
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
                    /* Dont add but update count */
                    exists = true;
                    child.count++;
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
}
