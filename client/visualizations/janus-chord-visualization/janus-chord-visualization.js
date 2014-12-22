JanusChordVisualization = function(id) {
    this.id = id;
    
    this.agents = [];
    this.spaces = [];
    this.inclusionLinks = [];
    this.chords  = [];
    
    this.chordPack = new ChordPack();
    this.header_messages = [];
    this.body_messages = [];
    this.svg = {};

    this.width = 800,
    this.height = 800;
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
        this.chordPack.dispatchEvent(headers, msg);
    }
};

/**
 * Updates the vizualization
 */ 
JanusChordVisualization.prototype.update = function() {
    
};

/**
 * Creates the svg and intialize it
 */
JanusChordVisualization.prototype.build = function() {
    
};
