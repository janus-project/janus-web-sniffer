JanusTreeMapVisualization = function(id) {
    this.id = id;
    this.tree = new Tree();
    this.grandparent;

    this.body_messages = [];
    this.header_messages = [];
    
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
                         // GrandParent
                         this.grandparent.append("text")
                         .attr("x", 14)
                         .attr("y", 14)
                         .attr("dy", ".75em")
                         .text(msg.agentType.split(/[.]+/).pop());
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
        var left_margin = 280;
        var padding_y = 0.5;
        var nodes = this.treemaplayout.nodes(this.tree.root),
            links = this.treemaplayout.links(nodes);

        var node = this.svg.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "treemapnode");

        node.append("rect")
            .attr("x", 1)
            .attr("y", 30)
            .attr("height", 80)
            .attr("width", 300)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("class", function(d) { return Utils.packJanusId(d.name); })

        var lineHeight = 15;
        var paddingRight = -20;
        node.append("text")
            .attr("dx", paddingRight) 
            .attr("dy", 2 * lineHeight)
            .text(this.tree.root.message[3]);

        console.log(this.tree.root.message[3]);
               


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

    this.grandparent = this.svg.append("g")
        .attr("class", "grandparent");

    this.grandparent.append("rect")
        .attr("y", 10)
        .attr("width", this.width)
        .attr("height", 20);
    


};

JanusTreeMapVisualization.prototype.displayMessage = function(id, visible) {
    d3.selectAll(this.id + " text." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
    d3.selectAll(this.id + " rect." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
};