JanusMatrixVisualization = function() {
    this.graph = new Graph();
    this.header_messages = [];
    this.body_messages = [];
    this.matrix = [];
    this.svg = {};

    this.width = 720,
    this.height = 720;
};

JanusMatrixVisualization.prototype.addInteraction = function(interaction) {
    var headers, msg;

    // check if string is well formed
    if(interaction.headers[0] == "{") { 
        headers = JSON.parse(interaction.headers);
        this.header_messages.push(headers);
    }
    if(interaction.body[0] == "{") {
        msg = JSON.parse(interaction.body);
        this.body_messages.push(msg);
    }

    if(msg) {
        if(msg.source != null) {
            var source = msg.source.agentId;
            var dest = interaction.contextId;

            var n1 = new GraphNode(source, "1");
            var n2 = new GraphNode(dest, "1");
            
            var iSource = this.graph.addNode(n1);
            var iDest = this.graph.addNode(n2);

            var value = 1;
            var link = new Link(iSource, iDest, value);

            this.graph.addLink(link);
        }
    }
};

JanusMatrixVisualization.prototype.update = function() {
    var nodes = this.graph.nodes;
    var n = nodes.length;

    var x = d3.scale.ordinal().domain(d3.range(n)).rangeBands([0, this.width]);
    var z = d3.scale.linear().domain([0, 4]).clamp(true);
    var c = d3.scale.category10().domain(d3.range(10));

    m = this.matrix;

    nodes.forEach(function(node, i) {
        node.index = i;
        node.count = 0;
        m[i] = d3.range(n).map(function(j) {
            return {x: j, y: i, z: 0}; 
        });
    });

    this.graph.links.forEach(function(link) {
        m[link.source][link.target].z += link.value;
        m[link.target][link.source].z += link.value;
        m[link.source][link.source].z += link.value;
        m[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    // removal 
    d3.selectAll("g.row").remove();
    d3.selectAll("g.column").remove();
    d3.selectAll("rect.background").remove();

    this.svg.append("rect")
      .attr("class", "background")
      .attr("width", this.width)
      .attr("height", this.height);
    
    var row = this.svg.selectAll(".row")
        .data(m)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { 
            return "translate(0," + x(i) + ")"; 
        })
        .each(row);
    
    row.append("line")
          .attr("x2", this.width);

    row.append("text")
          .attr("x", -6)
          .attr("y", x.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "end")
          .text(function(d, i) { return nodes[i].name; });
    
    var column = this.svg.selectAll(".column")
          .data(m)
        .enter().append("g")
          .attr("class", "column")
          .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
          .attr("x1", -this.width);

    column.append("text")
          .attr("x", 6)
          .attr("y", x.rangeBand() / 2)
          .attr("dy", ".32em")
          .attr("text-anchor", "start")
          .text(function(d, i) { return nodes[i].name; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function(d) { return d.z; }))
          .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("height", x.rangeBand())
            .style("fill-opacity", function(d) { return z(d.z); })
            .style("fill", function(d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null; })
            /*.on("mouseover", mouseover)
            .on("mouseout", mouseout);*/
    }
    /*
    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
        d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    }*/
};

JanusMatrixVisualization.prototype.build = function() {
    var margin = {top: 300, right: 0, bottom: 10, left: 300};

    this.svg = d3.select("#janus-matrix")
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
        .style("margin-left", -margin.left / 10 + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
};
