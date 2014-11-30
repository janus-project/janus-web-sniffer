JanusTreeMapVisualization = function(id) {
    this.id = id;

    this.tree = new Tree();
    this.grandparent;

    this.body_messages = [];
    this.header_messages = [];
    
    this.x;
    this.y;

    this.margin;
    this.width = 1000;
    this.height = 600;

    this.transitioning;
    this.formatNumber;

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
                    var node = new TreeNode("Treemap","");
                    this.tree.addMapNode(node, null);

                    if(this.tree.getMaxDepth() == 0)
                    {  
                         // GrandParent
                         this.grandparent.append("text")
                         .attr("x", 0)
                         .attr("y", 0)
                         .attr("dy", "1em")
                         .attr("dx", "1em")
                         .text(msg.agentType.split(/[.]+/).pop());
                    }
                } 

                var contextnode = new TreeNode(msg.source.spaceId.contextID, message);
                this.tree.addMapNode(contextnode, "Treemap");

                var spaceNode = new TreeNode(msg.source.spaceId.id);
                this.tree.addMapNode(spaceNode, msg.source.spaceId.contextID);

                console.log(this.tree.root.NextGenCount());
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

        //Test if the removal of only modified element is better than removing everything and redrawing the whole hierarchy
        d3.selectAll(this.id + " g.node").remove();
        d3.selectAll(this.id + " path.link").remove();

        var node = this.svg.selectAll("g.node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "treemapnode");

        node.append("rect")
            .attr("x", 0)
            .attr("y",20)
            .attr("height", 80)
            .attr("width", 150);

        /* This is how you do it */
        /*   .each(function(d) { console.log(d.message[2]); });*/
        console.log("\n");
        var lineHeight = 22;
        var paddingRight = 20;
        node.append("text")
            .attr("dx", paddingRight) 
            .attr("dy", 2 * lineHeight)
            .text(function(d) { 
               // if(d.depth == 1) { console.log(d.name + " " + d.count +  " " + d.depth); }
             return d.name; }); 
            
    }

    function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

};

/**
 * Constructs the svg and the layout of this visualization
 */
JanusTreeMapVisualization.prototype.build = function() {
    var svgWidthScale = 1.6;
    var treeLayoutScale = 2.6;
    
    /* Physical Appearance */
    this.margin = {top: 20, right: 0, bottom: 0, left: 0};
    this.width = 960;
    this.height = 500 - this.margin.top - this.margin.bottom,

    /* Format */
    this.formatNumber = d3.format(",d");

    /* Position */
    this.x = d3.scale.linear()
        .domain([0, this.width])
        .range([0, this.width]);

    this.y = d3.scale.linear()
        .domain([0, this.height])
        .range([0, this.height]);

    /* Actual Layout */
    this.treemaplayout = d3.layout.treemap()
        this.treelayout = d3.layout.tree()
        .size([this.height, this.width * treeLayoutScale]);

    /* Drawing */
    this.svg = d3.select(this.id)
        .attr("width", this.width * svgWidthScale)
        .attr("height", this.height);

    /* Top Label */
    this.grandparent = this.svg.append("g")
        .attr("class", "grandparent");

    this.grandparent.append("rect")
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", 20);
};

JanusTreeMapVisualization.prototype.displayMessage = function(id, visible) {
    d3.selectAll(this.id + " text." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
    d3.selectAll(this.id + " rect." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
};