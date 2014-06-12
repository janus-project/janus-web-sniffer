/**
 * Constructs a tree node 
 *  name : the name of the node
 *  message : the message stored in the node
 */
TreeNode = function(name, message) {
    this.message = message;
    this.name = name;
    this.children = [];
    this.depth = 0;
};

/**
 * Visits the node
 *  predicat : a function that returns a boolean, is the predicate used to trigger action
 *  params : the params of the predicate
 *  action : a function, something to do
 *  actionParams : the params of the action to do
 */ 
TreeNode.prototype.visit = function(predicat, params, action, actionParams) {
    for(var i in this.children) {
        var child = this.children[i];
        child.visit(predicat, params, action, actionParams);
    }
            
    if(predicat(this, params)) {
        return action(this, actionParams);   
    }
    return false;
};
