JanusChordVisualization = function(id) {
    this.id = id;
    
    this.width = 800;
    this.height = 800;
    
    this.header_messages = [];
    this.body_messages = [];
    this.svg = {};
    this.chordPackRenderer = new ChordPackRenderer(this.svg);
    this.chordPack;
};

/**
 * Adds an interaction : interaction is the interaction to add
 */ 
JanusChordVisualization.prototype.addInteraction = function(interaction) {
    var headers, msg;
    
    headers = JSON.parse(interaction.headers);
    this.header_messages.push(headers);

    msg = JSON.parse(interaction.body);
    this.body_messages.push(msg);

    if(msg) {
        if (this.chordPack == null) {
            this.chordPack = new ChordPack(msg.source.spaceId.contextID);
        }

        this.chordPack.dispatchEvent(headers, msg);
    }
};

/**
 * Updates the vizualization
 */ 
JanusChordVisualization.prototype.update = function() {
    
    this.chordPackRenderer.render(chordPack);
    
};

/**
 * Creates the svg and intialize it
 */
JanusChordVisualization.prototype.build = function() {
    var margin = {top: 300, right: 0, bottom: 10, left: 300};
    
    this.svg = d3.select(this.id)
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
        .style("margin-left", -margin.left / 10 + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
};
