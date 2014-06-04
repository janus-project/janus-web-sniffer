TreeNode = function(name, message) {
    this.message = message;
    this.name = name;
    this.children = [];
    this.depth = 0;
};

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
