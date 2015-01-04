ChordPackRenderer = function(id) {
    this.id = id;

    this.svg = null;
    this.width = 600;
    this.height = 600;

    this.depthToRender = 0;
    this.renderAllDepth = false;
};

ChordPackRenderer.prototype.init = function(chordPack) {
    this.svg = d3.select(this.id)
        .attr("width", this.width)
        .attr("height", this.height)
        .style("margin-top", "50px")
        .style("margin-bottom", "50px");
};

ChordPackRenderer.prototype.render = function(chordPack) {
    if (chordPack) {
        var radius = Math.min(this.width, this.height);
        var x = d3.scale.linear().range([0, radius]);
        var y = d3.scale.linear().range([0, radius]);

        // Create new pack layout
        var pack = d3.layout.pack()
            .size([radius, radius])
            .padding(0)
            .value(function(d) {
                // the value must be at least 1
                return d.spaces.length + 1;
            });

        // Apply pack layout on data
        var nodes = pack.nodes(chordPack);

        // Empty svg
        d3.selectAll("g").remove();

        // Create container for each context
        var svgGroups = this.svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "context")
            .attr("id", function(d) {
                return 'id_' + d.id;
            })
            .attr("innerRadius", function(d) {
                // return d.r - (1 * 10) / (d.depth + 1);
                return d.r - 10 - 10 * d.depth;
            })
            .attr("outerRadius", function(d) {
                return d.r - 10 * d.depth;
            })
            .attr("depth", function(d) {
                return d.depth;
            });

        // Create elements
        renderContexts(svgGroups);
        renderChords(svgGroups);
        renderLinks(svgGroups);
    }
};

function renderContexts(svgGroups) {

    svgGroups.append("svg:circle")
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

    svgGroups.append("svg:text")
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

}

function renderChords(svgGroups) {

    svgGroups.append("g")
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
                .append('g').attr('spaceId', function(d, i) {
                    return d.id;
                })
                .append("path")
                .style("fill-opacity", 0)
                .style("stroke", "#555")
                .style("stroke-opacity", 0.4)
                .attr("d", function(d, i) {
                    return arc(d.source, i);
                });
        });

}

function renderLinks(svgGroups) {

    var diagonal = d3.svg.diagonal.radial();

    svgGroups.append("g")
        .attr("class", "diagonals")
        .each(function(chordPack, i) {
            var chords = buildChords(chordPack.links);
            console.log('=======');
            console.log(chordPack);
            console.log('chords');
            console.log(chords);

            var parentNode = d3.select(this.parentNode);
            var circle = parentNode.select("circle");

            // X,Y are the coordinates of the parent
            // used to offset the children's links to the correct position
            var X = Number(circle.attr("cx"));
            var Y = Number(circle.attr("cy"));
            var chordRadius = Number(circle.attr("r"));

            // for each space that exists in this context
            // find child context
            // draw link between child and space

            d3.select(this).selectAll("g")
                .data(chords)
                .enter()
                .append("g").attr('spaceId', function(d, i) {
                    return d.id;
                })
                .each(function(chord, i) {
                    var spaceId = chord.id;
                    var childrenId = chordPack.links.getChildrenBySpaceId(spaceId);

                    // loop through children and make data for diagonal generator
                    var diagData = childrenId.map(function(contextId) {

                        // current child's centre
                        var circle = d3.select("#id_" + contextId).select("circle");
                        var cx = Number(circle.attr("cx"));
                        var cy = Number(circle.attr("cy"));

                        // chords angle are clockwise starting at noon
                        // to use trigonometry, we need counterclockwise (direct)
                        // starting at 3 o'clock ==> hence transformation
                        var startAngle = -chord.source.startAngle + Math.PI / 2;
                        var endAngle = -chord.source.endAngle + Math.PI / 2;

                        // link from the start of the chord
                        // to the center of the child
                        var diag1 = {
                            source: {
                                x: X + Math.cos(startAngle) * chordRadius,
                                y: Y - Math.sin(startAngle) * chordRadius
                            },
                            target: {
                                x: cx,
                                y: cy
                            }
                        };

                        // link from the center of the child
                        // to the end of the chord
                        var diag2 = {
                            source: {
                                x: cx,
                                y: cy
                            },
                            target: {
                                x: X + Math.cos(endAngle) * chordRadius,
                                y: Y - Math.sin(endAngle) * chordRadius
                            }
                        };

                        return [diag1, diag2];
                    });

                    d3.select(this).selectAll("path")
                        .data(diagData)
                        .enter()
                        .append("path")
                        .attr("d", function(d, i) {
                            var linkRadius = 0;

                            // large-arc-flag and sweep-flag for drawing the
                            // elliptical arc curve in the correct direction
                            // if this is not there, arcs are shortest path (no obtuse angles :((( )
                            var flags = (chordPack.spaces.length == 1) ? '1,0' : '0,0';

                            var pathString = diagonal(d[0], i);
                            pathString += "L" + String(diagonal(d[1], i)).substr(1);
                            pathString += "A" + chordRadius + "," + chordRadius + " 0 " + flags + ' ' + d[0].source.x + "," + d[0].source.y;

                            console.log('pathString :', pathString);
                            return pathString;
                        })
                        .style("stroke", function(d) {
                            return "#F80018";
                        })
                        .style("stroke-opacity", .07)
                        // .style("stroke-width",function (d) { return d.links[0].strokeWeight;})
                        .style("fill-opacity", 0.1)
                        .style("fill", function(d) {
                            return "#F80018";
                        });
                });

        });
}

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

    // dynamically add spaceId to each chord
    var spaces = biLink.getAllSpaces();
    chords.forEach(function(el) {
        var index = el.source.index;
        el.id = spaces[index];
    });

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
