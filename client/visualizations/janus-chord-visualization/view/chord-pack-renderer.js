ChordPackRenderer = function(id) {
    this.id = id;

    this.svg = null;
    this.width = 800;
    this.height = 800;

};

ChordPackRenderer.prototype.init = function(chordPack) {

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    this.svg = d3.select(this.id)
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
        .style("margin-left", -margin.left / 10 + "px");

};

ChordPackRenderer.prototype.render = function(chordPack) {
    if (chordPack) {
        var radius = Math.min(this.width, this.height);
        var x = d3.scale.linear().range([0, radius]);
        var y = d3.scale.linear().range([0, radius]);

        // Create new pack layout
        var pack = d3.layout.pack()
            .size([radius, radius])
            .padding(10)
            .value(function(d) {
                // the value must be at least 1
                return d.spaces.length + 1;
            });

        // Apply pack layout on data
        var nodes = pack.nodes(chordPack);

        // Empty svg
        d3.selectAll("g").remove();

        // Create container for each context
        this.svgGroups = this.svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "context")
            .attr("id", function(d) {
                return d.id;
            })
            .attr("innerRadius", function(d) {
                // return d.r - (1 * 10) / (d.depth + 1);
                return d.r - 10;
            })
            .attr("outerRadius", function(d) {
                return d.r;
            })
            .attr("depth", function(d) {
                return d.depth;
            });

        // Create elements
        this.renderContexts();
        this.renderChords();
        this.renderLinks(chordPack.links);
    }
};

ChordPackRenderer.prototype.renderContexts = function() {

    this.svgGroups.append("svg:circle")
        .attr("class", function(d) {
            return d.children ? "parent" : "child";
        })
        .attr("cx", function(d) {
            return d.x;
        })
        .attr("cy", function(d) {
            return d.y;
        })
        .attr("r", function(d) {
            return d3.select(this.parentNode).attr("innerRadius");
        });

    this.svgGroups.append("svg:text")
        .attr("class", function(d) {
            return d.children ? "parent" : "child";
        })
        .attr("x", function(d) {
            return d.x;
        })
        .attr("y", function(d) {
            var innerRadius = d3.select(this.parentNode).attr("innerRadius");
            return d.y - innerRadius * 0.5;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("opacity", function(d) {
            return d.r > 20 ? 1 - 0.1 * d.depth : 0;
        })
        .text(function(d) {
            return d.id;
        });

};

ChordPackRenderer.prototype.renderChords = function() {

    this.svgGroups.append("g")
        .attr("class", "arcs")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .each(function(d, i) {
            var chords = buildChords(d.links);
            console.log(chords);

            var innerRadius = d3.select(this.parentNode).attr("innerRadius");
            var outerRadius = d3.select(this.parentNode).attr("outerRadius");
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

            d3.select(this).selectAll("path")
                .data(chords)
                .enter()
                .append("path")
                .style("fill-opacity", 0)
                .style("stroke", "#555")
                .style("stroke-opacity", 0.4)
                .attr("d", function(d, i) {
                    return arc(d.source, i);
                });
        });

};

ChordPackRenderer.prototype.renderLinks = function() {


    /*  ARC SEGMENTS */
    // this.svgGroups.append("g")
    //     .attr("class", "arc")
    //     .append("path")
    //     .attr("id", function(d) {
    //         return "a_" + d.Key;
    //     })
    //     // .style("fill", function (d) {
    //     //     return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
    //     // })
    //     .style("fill-opacity", .2)
    //     .attr("d", function(d, i) {
    //         var newArc = {};
    //         var relatedChord = chordsById[d.CMTE_ID];

    //         newArc.startAngle = relatedChord.currentAngle;
    //         relatedChord.currentAngle = relatedChord.currentAngle + (Number(d.TRANSACTION_AMT) / relatedChord.value) * (relatedChord.endAngle - relatedChord.startAngle);
    //         newArc.endAngle = relatedChord.currentAngle;
    //         newArc.value = Number(d.TRANSACTION_AMT);
    //         var arc = d3.svg.arc(d, i).innerRadius(linkRadius).outerRadius(innerRadius);

    //         return arc(newArc, i);
    //     });
};

function buildChords(biLink) {
    // Create a new chord layout
    var chord = d3.layout.chord()
        .padding(.05)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

    // Matrix to give to chord layout
    var matrix = biLink.computeChordMatrix();

    // set chord's matrix and compute chords
    chord.matrix(matrix);

    // Output from chord layout
    var chords = chord.chords();

    // chords.forEach(function(d, index) {
    //     d.angle = (d.source.startAngle + d.source.endAngle) / 2
    //     var o = {
    //         startAngle: d.source.startAngle,
    //         endAngle: d.source.endAngle,
    //         index: d.source.index,
    //         value: d.source.value,
    //         currentAngle: d.source.startAngle,
    //         currentLinkAngle: d.source.startAngle,
    //         Amount: d.source.value,
    //         source: d.source,
    //         relatedLinks: []
    //     };
    //     chordsById[d.label] = o;
    // });

    return chords;
}



/*
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
*/
