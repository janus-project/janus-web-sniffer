ChordPackRenderer = function(svg) {
    
    this.svg = svg;
    this.width = 800;
    this.height = 800;
    
}

ChordPackRenderer.prototype.render = function(chordPack) {
    
    renderContexts(chordPack.children);
    
    renderChords(chordPack.spaces);
    
    renderLinks(chordPack.links);
    
}

ChordPackRenderer.prototype.renderContext = function(contextId, spaceIds) {
    
    
    
    
}

ChordPackRenderer.prototype.renderChords = function() {
    
}

ChordPackRenderer.prototype.renderLinks = function() {
    
}


function zoom(d, i) {
  //d : cercle sur lequel on a cliqué
  
  var k = r / d.r / 2; // facteur de zoom (diamètre du cercle par rapport à la taille de l'écran)
  
  // domain : définit les fonctions x et y qui retournent position d'un point une fois qu'on applique le zoom
  // on passe les bornes de l'élément qu'on veut mettre en plein écran
  x.domain([d.x - d.r, d.x + d.r]);
  y.domain([d.y - d.r, d.y + d.r]);

  // transition progressive
  var t = vis.transition()
      .duration(d3.event.altKey ? 7500 : 750);

  // on récupère tous les cercles
  t.selectAll("circle")
      // on fait varier les coordonnées du cercle avec la fonction x (d est le centre de l'élément à bouger)
      .attr("cx", function(d) { return x(d.x); })
      .attr("cy", function(d) { return y(d.y); })
      // on fait varier le rayon par rapport au facteur de zoom
      .attr("r", function(d) { return k * d.r; });

  // on récupère les champs de texte
  t.selectAll("text")
      // variation des coordonnées
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      // variation de l'opacité : si le texte a une taille supérieure à 20 on l'affiche, sinon on le masque
      .style("opacity", function(d) { return k * d.r > 20 ? 1 : 0; });

  node = d;
  d3.event.stopPropagation();
}


var w = 1280,
    h = 800,
    r = 720,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r]),
    node,
    root;

var pack = d3.layout.pack()
    .size([r, r])
    .value(function(d) { return d.size; })

var vis = d3.select("body").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")");

d3.json("flare.json", function(data) {
  node = root = data;

  var nodes = pack.nodes(root);

  vis.selectAll("circle")
      .data(nodes)
    .enter().append("svg:circle")
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return d.r; })
      .on("click", function(d) { return zoom(node == d ? root : d); });

  vis.selectAll("text")
      .data(nodes)
    .enter().append("svg:text")
      .attr("class", function(d) { return d.children ? "parent" : "child"; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("opacity", function(d) { return d.r > 20 ? 1 : 0; })
      .text(function(d) { return d.name; });

  d3.select(window).on("click", function() { zoom(root); });
});
