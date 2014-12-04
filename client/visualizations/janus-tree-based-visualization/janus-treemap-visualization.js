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
                var tcontext = "context";
                var tspace = "space";

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

                var contextnode = new TreeNode(msg.source.spaceId.contextID, tcontext);
                this.tree.addMapNode(contextnode, "Treemap");

                /* Not for the moment 
                var spaceNode = new TreeNode(msg.source.spaceId.id, tspace);
                this.tree.addMapNode(spaceNode, msg.source.spaceId.contextID);*/
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
        var nodes = this.treemaplayout.nodes(this.tree.root);

       // console.log(nodes);


        //Test if the removal of only modified element is better than removing everything and redrawing the whole hierarchy
        d3.selectAll(this.id + " g.node").remove();
        d3.selectAll(this.id + " path.link").remove();

        var node = this.svg.selectAll("g.treemapnode")
            .data(nodes)
            .enter().append("g")
            .attr("class", "treemapnode");

        node.append("rect")
            .call(position);

        
            
    }

    function position() {
      this.attr("x", function(d) { return d.x + "px"; })
          .attr("y", function(d) { return d.y + "px"; })
          .attr("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
          .attr("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
    }

};

/**
 * Constructs the svg and the layout of this visualization
 */
JanusTreeMapVisualization.prototype.build = function() {
   /* var svgWidthScale = 1.6;
    var treeLayoutScale = 2.6; */
    
    /* Physical Appearance */
    this.margin = {top: 20, right: 0, bottom: 0, left: 0};
    this.width = 1000;
    this.height = 500 - this.margin.top - this.margin.bottom,

    /* Format */
    this.formatNumber = d3.format(",d");

    /* Actual Layout */
    this.treemaplayout = d3.layout.treemap()
        .size([this.width, this.height])
        .value(function(d) { return d.count; });

    /* Drawing */
    this.svg = d3.select(this.id)
        .attr("width", this.width)
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
