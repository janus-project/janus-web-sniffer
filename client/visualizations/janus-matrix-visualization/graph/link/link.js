Link = function(source, target, value) {
	this.messages = [];
    this.source = source;
    this.target = target;
    this.value = value;
};

/**
 * The data stored in the link
 */ 
Link.prototype.addMessage = function(message) {
	this.messages.push(message);
};