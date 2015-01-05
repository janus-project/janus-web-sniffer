JanusChordVisualization = function(svgId) {
    this.svgId = svgId;

    this.chordPackRenderer = new ChordPackRenderer(this.svgId);

    // root element
    this.chordPack = null;

    this.unhandledEvents = [];
};

/**
 * Adds an interaction : interaction is the interaction to add
 */
JanusChordVisualization.prototype.addInteraction = function(interaction) {
    var headers, msg;

    headers = JSON.parse(interaction.headers);
    msg = JSON.parse(interaction.body);

    if (msg) {
        var msgContextId = msg.source.spaceId.contextID;
        var msgSenderId = msg.source.agentId;
        var msgSpaceId = msg.source.spaceId.id;

        if (this.chordPack == null) {
            this.chordPack = new ChordPack(msgContextId);
            // debug
            chordPackDEBUG = this.chordPack;
        }

        var isNewRoot = msgSenderId == this.chordPack.id && msgContextId != this.chordPack.id;
        if (isNewRoot) {
            console.info('NEW ROOT');

            var oldRoot = this.chordPack;
            this.chordPack = new ChordPack(msgContextId);
            this.chordPack.attachChordPack(oldRoot, msgSpaceId);
        }
        else {
            var handled = this.chordPack.dispatchEvent(headers, msg);

            if (!handled) {
                this.unhandledEvents.push([headers, msg]);
            }

            // Try to handle previously unhandled events
            var that = this;
            var events = this.unhandledEvents;
            this.unhandledEvents = [];
            events.forEach(function(el) {
                var handled = that.chordPack.dispatchEvent(el[0], el[1]);

                if (!handled) {
                    that.unhandledEvents.push(el);
                }
            });
        }

    }
};

/**
 * Updates the vizualization
 */
JanusChordVisualization.prototype.update = function() {

    this.chordPackRenderer.render(this.chordPack);

};

/**
 * Creates the svg and intialize it
 */
JanusChordVisualization.prototype.build = function() {

    this.chordPackRenderer.init();

};
