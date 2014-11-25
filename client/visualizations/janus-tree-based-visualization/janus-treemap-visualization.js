JanusTreeMapVisualization = function(id) {
    this.id = id;
    this.body_messages = [];
    this.header_messages = [];
    this.tree = new Tree();
    this.width = 1000;
    this.height = 600;
    this.treemaplayout = {};
    this.svg = {};
    this.lastMaxDepth = 0;
};

/**
 * Adds an interaction in the visualization
 *  interaction is the interaction to add
 */ 
JanusTreeMapVisualization.prototype.addInteraction = function(interaction) {
  var headers, msg;
 
    headers = JSON.parse(interaction.headers);
    this.header_messages.push(headers);

    msg = JSON.parse(interaction.body);
    this.body_messages.push(msg);
            
    if(headers && msg) {
        if(headers[janus_events["event-type"]] == janus_events["member-joined"]) {
            if(msg.agentID && msg.parentContextID) {
                var message = [];

                // add additionnal informations here
                message.push("agent type : " + msg.agentType); 
                message.push("space id : " + msg.source.spaceId.id);
                message.push("context id : " + msg.source.spaceId.contextID);

                if(this.tree.nodeCount == 0) {
                    // add root
                    var node = new TreeNode(msg.parentContextID, message);
                    this.tree.addNode(node, null);

                    if(this.tree.getMaxDepth() == 0)
                    {   
                        var grandparent = this.svg.append("g")
                        .attr("class", "grandparent");
                    
                        grandparent.append("rect")
                                .attr("x", 10)
                                .attr("y", 10)
                                .attr("width", this.width)
                                .attr("height", 20);   

                        grandparent.append("text")
                            .attr("x", 16)
                            .attr("y", 16)
                            .attr("dy", ".75em")
                            .text(this.tree.root.message[2]);  
                    }
                } 

                var node = new TreeNode(msg.agentID, message);
                this.tree.addNode(node, msg.parentContextID);
            }
        }
    }
};

/** 
 * Update the d3 visualization
 */
JanusTreeMapVisualization.prototype.update = function() {
    if(this.tree.root != null) {
        var jtm = this;
        var left_margin;
    }
};

/**
 * Constructs the svg and the layout of this visualization
 */
JanusTreeMapVisualization.prototype.build = function() {
    var svgWidthScale = 1.6;
    
    this.svg = d3.select(this.id)
        .attr("width", this.width * svgWidthScale)
        .attr("height", this.height);

    this.treemaplayout = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(this.height / this.width * svgWidthScale * (1 + Math.sqrt(5)))
        .round(false);        
};

JanusTreeMapVisualization.prototype.displayMessage = function(id, visible) {
    d3.selectAll(this.id + " text." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
    d3.selectAll(this.id + " rect." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
};