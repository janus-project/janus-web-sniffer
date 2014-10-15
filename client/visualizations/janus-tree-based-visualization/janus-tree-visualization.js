JanusTreeVisualization = function(id) {
    this.id = id;
    this.body_messages = [];
    this.header_messages = [];
    this.tree = new Tree();
    this.width = 1000;
    this.height = 1500;
    this.treelayout = {};
    this.svg = {};
    this.lastMaxDepth = 0;
};

/**
 * Adds an interaction in the visualization
 *  interaction is the interaction to add
 */ 
JanusTreeVisualization.prototype.addInteraction = function(interaction) {
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
JanusTreeVisualization.prototype.update = function() {
    if(this.tree.root != null) {
        var jtv = this;
        var left_margin = 280;
        var padding_y = 0.5;
        var nodes = this.treelayout.nodes(this.tree.root),
            links = this.treelayout.links(nodes);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) 
            { 
                var dy = left_margin + d.y * padding_y;
                return [dy, d.x]; 
            });
     
        //Test if the removal of only modified element is better than removing everything and redrawing the whole hierarchy
        d3.selectAll(this.id + " g.node").remove();
        d3.selectAll(this.id + " path.link").remove();

        var link = this.svg.selectAll("path.link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = this.svg.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .on("mouseover", function(d) { jtv.displayMessage(d.name, true); })
            .on("mouseout", function(d) { jtv.displayMessage(d.name, false); })
            .attr("transform", function(d) { 
                var dy = left_margin + d.y * padding_y;
                return "translate(" + dy + "," + d.x + ")"; 
            });


        node.append("rect")
        .attr("x", -300)
        .attr("y", 10)
        .attr("height", 80)
        .attr("width", 300)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("visibility", "hidden")
        .attr("class", function(d) { return Utils.packJanusId(d.name); })

        var lineHeight = 15;
        var paddingRight = -20;
        node.append("text")
            .attr("dx", paddingRight) 
            .attr("dy", 2 * lineHeight)
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .attr("visibility", "hidden")
            .attr("class", function(d) { return Utils.packJanusId(d.name); })
            .text("agent")
            .each(function(d) {
                var text = d3.select(this);
                for(var i = 0; i < d.message.length; ++i) {
                    text.append("tspan")
                        .attr("x", paddingRight)
                        .attr("y", (i + 3) * lineHeight)
                        .text(d.message[i]);
                }
            });

        node.append("circle")
            .attr("r", 5);
        
        node.append("text")
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", 3)
            .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });

        d3.select(self.frameElement).style("height", this.height + "px");

        var currentDepth = this.tree.getMaxDepth();
        
        if(this.lastMaxDepth != this.tree.getMaxDepth()) {
            var uuidWidth = this.tree.root.name.length;
            this.width = this.width + uuidWidth * Math.abs(this.lastMaxDepth - currentDepth);
            this.build();
        }
        this.lastMaxDepth = this.tree.getMaxDepth();
    }
};

/**
 * Constructs the svg and the layout of this visualization
 */
JanusTreeVisualization.prototype.build = function() {
    var svgWidthScale = 1.6;
    var treeLayoutScale = 2.6;
    
    this.svg = d3.select(this.id)
        .attr("width", this.width * svgWidthScale)
        .attr("height", this.height);

    this.treelayout = d3.layout.tree()
        .size([this.height, this.width * treeLayoutScale]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
};

JanusTreeVisualization.prototype.displayMessage = function(id, visible) {
    d3.selectAll(this.id + " text." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
    d3.selectAll(this.id + " rect." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
};
