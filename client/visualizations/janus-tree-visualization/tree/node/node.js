Node = function(name) {
    this.name = name;
    this.children = [];
};

Node.prototype.visit = function(predicat, params, action, actionParams) {
    for(var i in this.children) {
        var child = this.children[i];
        child.visit(predicat, params, action, actionParams);
    }
            
    if(predicat(this, params)) {
        return action(this, actionParams);   
    }
    return false;
};
