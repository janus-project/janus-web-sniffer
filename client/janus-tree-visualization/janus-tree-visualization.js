JanusTreeVisualization = function() {};

JanusTreeVisualization.prototype.addInteraction = function(interaction) {
    jtv.context_by_space[interaction.spaceId] = interaction.contextId;
    jtv.space_by_context[interaction.contextId] = interaction.spaceId;
    jtv.body_messages.push(JSON.parse(interaction.body));
    jtv.header_messages.push(JSON.parse(interaction.headers));

    var headers = JSON.parse(interaction.headers);
    var msg = JSON.parse(interaction.body);

    if(headers["x-java-event-class"] == "io.sarl.core.ContextJoined") {
        if(msg.holonContextID && this.tree.nodeCount == 0) {
            var node = new Node(msg.holonContextID);
            this.tree.addNode(node, "root");
        }
    } else if(headers["x-java-event-class"] == "io.sarl.core.MemberJoined") {
        if(msg.agentID) {
            var node = new Node(msg.agentID);
            this.tree.addNode(node, msg.parentContextID);
        }
    }
};

JanusTreeVisualization.prototype.init = function() {
    this.context_by_space = {};
    this.space_by_context = {};
    this.interactions_count = 0;
    this.body_messages = [];
    this.header_messages = [];
    this.tree = new Tree(new Node('root'));
    this.width = 960;
    this.height = 2000;
};  

JanusTreeVisualization.prototype.update = function() {
    var nodes = this.treelayout.nodes(this.tree.root),
        links = this.treelayout.links(nodes);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
 
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
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    node.append("circle")
        .attr("r", 5);

    node.append("text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", 3)
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });

    d3.select(self.frameElement).style("height", this.height + "px");
};

JanusTreeVisualization.prototype.build = function() {
    this.svg = d3.select("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("transform", "translate(40,0)");

    this.treelayout = d3.layout.tree()
        .size([this.height, this.width - 160]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
};
