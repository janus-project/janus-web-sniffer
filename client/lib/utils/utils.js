var MouseCoords = [0, 0];

d3.select('html').on('mousemove', function() { 
	MouseCoords = d3.mouse(this); 
});

Utils = function() {};

Utils.packJanusId = function(janusId) {
	return "janus-" + janusId.replace(/\-/g, "");
};

Utils.getAbsoluteMouseCoordinates = function() {
	return MouseCoords;
};