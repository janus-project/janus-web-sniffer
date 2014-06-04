Utils = function() {}

Utils.packJanusId = function(janusId) {
	return "janus-" + janusId.replace(/\-/g, "");
}