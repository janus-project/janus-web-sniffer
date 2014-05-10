JanusTreeVisualization = function() {
    this.context_by_space = {};
    this.space_by_context = {};
    this.interactions_count = 0;
    this.body_messages = [];
    this.header_messages = [];
    this.tree = new Tree();
    this.width = 1000;
    this.height = 1500;
    this.treelayout = {};
    this.svg = {};
    this.lastMaxDepth = 0;
};

JanusTreeVisualization.prototype.addInteraction = function(interaction) {
    jtv.context_by_space[interaction.spaceId] = interaction.contextId;
    jtv.space_by_context[interaction.contextId] = interaction.spaceId;

    var headers, msg;

    // check if string is well formed
    if(interaction.headers[0] == "{") { 
        headers = JSON.parse(interaction.headers);
        jtv.header_messages.push(headers);
    }
    if(interaction.body[0] == "{") {
        msg = JSON.parse(interaction.body);
        jtv.body_messages.push(msg);
    }
            
    if(headers && msg) {
        if(headers[janus_events["event-type"]] == janus_events["context-joined"]) {
            if(msg.holonContextID && this.tree.nodeCount == 0) {
                var node = new Node(msg.holonContextID);
                // add root
                this.tree.addNode(node, null);
            }
        } else if(headers[janus_events["event-type"]] == janus_events["member-joined"]) {
            if(msg.agentID) {
                var node = new Node(msg.agentID);
                this.tree.addNode(node, msg.parentContextID);
            }
        }
    }
};

JanusTreeVisualization.prototype.update = function() {
    if(this.tree.root != null) {
        var left_margin = 200;
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
        d3.selectAll("g.node").remove();
        d3.selectAll("path.link").remove();

        var link = this.svg.selectAll("path.link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

        var node = this.svg.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) 
                { 
                    var dy = left_margin + d.y * padding_y;
                    return "translate(" + dy + "," + d.x + ")"; 
                })

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
            var uuidWidth = this.tree.root.name.length();
            var widthScale = 10;
            this.width = this.width + widthScale * uuidWidth * Math.abs(this.lastMaxDepth - currentDepth);
            this.build();
        }
        this.lastMaxDepth = this.tree.getMaxDepth();
    }
};

JanusTreeVisualization.prototype.build = function() {
    var svgWidthScale = 1.6;
    var treeLayoutScale = 2.6;
    
    this.svg = d3.select("#janus-tree")
        .attr("width", this.width * svgWidthScale)
        .attr("height", this.height);

    this.treelayout = d3.layout.tree()
        .size([this.height, this.width * treeLayoutScale]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
};
