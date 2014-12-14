JanusTreeMapVisualization = function(id) {
    
    /* ID */
    this.id = id;

    /* Data Struct */
    this.tree = new Tree();
    this.lastMaxDepth = 0;
     
    /* Database */
    this.body_messages = [];
    this.header_messages = [];
    
    /* Graphics*/
    this.margin = {top: 20, right: 0, bottom: 0, left: 0};
    this.width = 960;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.x = d3.scale.linear()
        .domain([0, this.width])
        .range([0, this.width]);

    this.y = d3.scale.linear()
        .domain([0, this.height])
        .range([0, this.height]);

    this.svg = {};
    this.treemaplayout = {};

    /* Stuff */
    this.formatNumber = d3.format(",d");
    this.transitioning;    
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
                } 

                var contextnode = new TreeNode(msg.source.spaceId.contextID, tcontext);
                this.tree.addMapNode(contextnode, "Treemap");

                /* Not for the moment */
                var spaceNode = new TreeNode(msg.source.spaceId.id, tspace);
                this.tree.addMapNode(spaceNode, msg.source.spaceId.contextID); 
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

     

        //Test if the removal of only modified element is better than removing everything and redrawing the whole hierarchy
        d3.selectAll(this.id + " g.node").remove();
        d3.selectAll(this.id + " g.depth").remove();

        initialize(this.tree.root, this.width, this.height);
        accumulate(this.tree.root);
        this.layout(this.tree.root);
        this.display(this.tree.root);

    }

    


    

    function initialize(root, width, height) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when layout is computed.
    function accumulate(d) {
      return (d._children = d.children)
          ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
          : d.value;
    }

     
};

/** 
 * Layout
 */
JanusTreeMapVisualization.prototype.layout = function(d) {
    var self = this;
    if (d._children) {
      this.treemaplayout.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        self.layout(c);
      });
    }
}


/** 
 * Display
 */
JanusTreeMapVisualization.prototype.display = function(d) {
    var self = this;
    
     function fontSize(d,i) {
      var size = d.dx/5;
      var words = d.name.split('-');
      var word = words[0];
      var width = d.dx;
      var height = d.dy;
      var length = 0;
      d3.select(this).style("font-size", size + "px").text(word);
      while(((this.getBBox().width >= width) || (this.getBBox().height >= height)) && (size > 12))
       {
        size--;
        d3.select(this).style("font-size", size + "px");
        this.firstChild.name = word;
       }
    } 

    function text(text) {
      text.attr("x", function(d) { return self.x(d.x) + 6; })
        .attr("y", function(d) { return self.y(d.y) + 6; });
    }

    function rect(rect) {
      rect.attr("x", function(d) { return self.x(d.x); })
          .attr("y", function(d) { return self.y(d.y); })
          .attr("width", function(d) { return self.x(d.x + d.dx) - self.x(d.x); })
          .attr("height", function(d) { return self.y(d.y + d.dy) - self.y(d.y); });
    }

    function name(d) {
      return d.parent
          ? name(d.parent) + "." + d.name
          : d.name;
    }

    function transition(d) {
      if (self.transitioning || !d) return;
      self.transitioning = true;

      var g2 = self.display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      self.x.domain([d.x, d.x + d.dx]);
      self.y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      self.svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      self.svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        self.svg.style("shape-rendering", "crispEdges");
        self.transitioning = false;
      });
    }

    this.grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    var g1 = this.svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g")

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return "(" + self.formatNumber(d.value) + ")   " + d.name; });

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text)
        .each(fontSize);

    

    return g;
  
}

/**
 * Constructs the svg and the layout of this visualization
 */
JanusTreeMapVisualization.prototype.build = function() {

    /* Layout */
    this.treemaplayout = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .ratio(this.height / this.width * 0.5 * (1 + Math.sqrt(5)))
        .round(false)
        .value(function(d) { return d.count; })
        .sort(function(a, b) { return a.value - b.value; });
 

    /* SVG */
    this.svg = d3.select(this.id)
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.bottom + this.margin.top)
        .style("margin-left", -this.margin.left + "px")
        .style("margin.right", -this.margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .style("shape-rendering", "crispEdges");

    /* Top Bar */
    this.grandparent = this.svg.append("g")
    .attr("class", "grandparent");

    this.grandparent.append("rect")
        .attr("y", -this.margin.top)
        .attr("width", this.width)
        .attr("height", this.margin.top);

    this.grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - this.margin.top)
        .attr("dy", ".75em");

};

JanusTreeMapVisualization.prototype.displayMessage = function(id, visible) {
    d3.selectAll(this.id + " text." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
    d3.selectAll(this.id + " rect." + Utils.packJanusId(id))
        .attr("visibility", visible ? "visible" : "hidden");
};
