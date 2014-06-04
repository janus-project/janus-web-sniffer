Link = function(source, target, value) {
	this.messages = [];
    this.source = source;
    this.target = target;
    this.value = value;
};

Link.prototype.addMessage = function(message) {
	this.messages.push(message);
};