/**
 * ChordPackRenderer is responsible for drawing a ChordPack recursively
 * on the svg with the given svgId.
 */
ChordPackRenderer = function(svgId) {
    this.svgId = svgId;

    this.svg = null;
    this.width = 800;
    this.height = 800;
    this.radius = Math.min(this.width, this.height);

    this.depthToRender = 0;
    this.renderAllDepth = false;

    this.colors = d3.scale.ordinal().range(['#e51c23', '#673ab7', '#03a9f4', '#259b24', '#ff9800']);
    this.opacities = {
        textOpacity: 0.3,
        contextOpacity: 0.15,
        chordOpacity: 0.15,
        linkOpacity: 0.1
    };
};

ChordPackRenderer.prototype.init = function() {
    this.svg = d3.select(this.svgId)
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
        .style('margin-top', '50px')
        .style('margin-bottom', '50px');
};

ChordPackRenderer.prototype.render = function(chordPack) {
    var that = this;
    if (chordPack) {

        // Create new pack layout
        var pack = d3.layout.pack()
            .size([this.radius, this.radius])
            .padding(0)
            .value(function(d) {
                // the value must be at least 1
                return d.spaces.length + 1;
            });

        // Apply pack layout on data
        var chordPacks = pack.nodes(chordPack);

        // Empty svg
        this.svg.selectAll('g').remove();

        // Create container for each context
        var svgGroups = this.svg.selectAll('g')
            .data(chordPacks)
            .enter()
            .append('g')
            .attr('class', 'context')
            .attr('id', function(d) {
                return 'id_' + d.id;
            })
            .each(function(d, i) {
                // By default if we are the only child, pack layout compute the same radius as our parent.
                // To make us visible, we divide the radius by 2
                if (d.parent && d.parent.children.length == 1) {
                    d.r = d.r / 2
                }
            })
            .attr('innerRadius', function(d) {
                return d.r - 10;
            })
            .attr('outerRadius', function(d) {
                return d.r;
            })
            .attr('depth', function(d) {
                return d.depth;
            });

        // Create elements
        renderContexts(svgGroups, this.colors, this.opacities, this.svg);
        renderChords(svgGroups, this.colors, this.opacities);
        renderLinks(svgGroups, this.colors, this.opacities);
    }
};

function renderContexts(svgGroups, colors, opacities, svg) {

    svgGroups.append('circle')
        .attr('cx', function(d) {
            return d.x;
        })
        .attr('cy', function(d) {
            return d.y;
        })
        .attr('r', function(d) {
            return d3.select(this.parentNode).attr('innerRadius');
        })
        .style('fill', function(d, i) {
            return colors(d.depth);
        })
        .style('fill-opacity', opacities.contextOpacity)
        .on('click', function(d) {
            zoom(svg, d);
        })
        .on('mouseover', function(d) {
            highlightCircle(this, svg, opacities, true);
        })
        .on('mouseout', function(d) {
            highlightCircle(this, svg, opacities, false);
        });

    svgGroups.append('text')
        .attr('x', function(d) {
            return d.x;
        })
        .attr('y', function(d) {
            var innerRadius = d3.select(this.parentNode).attr('innerRadius');
            return d.y - innerRadius * 0.5;
        })
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('fill-opacity', opacities.textOpacity)
        .text(function(d) {
            // return d.id;
            return d.id.split('-')[0] + '...';
        });

}

function renderChords(svgGroups, colors, opacities) {

    svgGroups.append('g')
        .attr('class', 'arcs')
        .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        })
        .each(function(chordPack, i) {
            var depth = chordPack.depth;
            var chords = buildChords(chordPack.links);

            var innerRadius = d3.select(this.parentNode).attr('innerRadius');
            var outerRadius = d3.select(this.parentNode).attr('outerRadius');
            var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

            d3.select(this).selectAll('path')
                .data(chords)
                .enter()
                .append('g').attr('spaceId', function(d, i) {
                    return d.id;
                })
                .append('path')
                .style('fill', function(d, i) {
                    return colors(depth);
                })
                .style('fill-opacity', opacities.chordOpacity)
                .style('stroke-opacity', 0.5)
                .style('stroke', function(d, i) {
                    return colors(depth);
                })
                .attr('d', function(d, i) {
                    return arc(d.source, i);
                });
        });

}

function renderLinks(svgGroups, colors, opacities) {

    var diagonal = d3.svg.diagonal.radial();

    // we don't want links to hide circles so must insert before
    svgGroups.insert('g', 'circle')
        .attr('class', 'diagonals')
        .each(function(chordPack, i) {
            var depth = chordPack.depth;
            var chords = buildChords(chordPack.links);

            var parentNode = d3.select(this.parentNode);
            var circle = parentNode.select('circle');

            // X,Y are the coordinates of the parent
            // used to offset the children's links to the correct position
            var X = Number(circle.attr('cx'));
            var Y = Number(circle.attr('cy'));
            var chordRadius = Number(circle.attr('r'));

            // for each space that exists in this context
            // find child context
            // draw link between child and space

            d3.select(this).selectAll('g')
                .data(chords)
                .enter()
                .append('g')
                .attr('spaceId', function(d, i) {
                    return d.id;
                })
                .attr('contextId', function(d) {
                    return 'id_' + chordPack.id;
                })
                .each(function(chord, i) {
                    var spaceId = chord.id;
                    var childrenId = chordPack.links.getChildrenBySpaceId(spaceId);

                    // loop through children and make data for diagonal generator
                    var diagData = childrenId.map(function(contextId) {

                        // current child's centre
                        var circle = d3.select('#id_' + contextId).select('circle');
                        var cx = Number(circle.attr('cx'));
                        var cy = Number(circle.attr('cy'));

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

                        return {
                            contextId: contextId,
                            obtuse: chord.source.endAngle - chord.source.startAngle > Math.PI,
                            diag1: diag1,
                            diag2: diag2
                        };
                    });

                    d3.select(this).selectAll('path')
                        .data(diagData)
                        .enter()
                        .append('path')
                        .attr('d', function(d, i) {
                            // large-arc-flag and sweep-flag for drawing the
                            // elliptical arc curve in the correct direction
                            // if this is not there, arcs are shortest path (no obtuse angles :((( )
                            var flags = d.obtuse ? '1,0' : '0,0';

                            var pathString = diagonal(d.diag1, i);
                            pathString += 'L' + String(diagonal(d.diag2, i)).substr(1);
                            pathString += 'A' + chordRadius + ',' + chordRadius + ' 0 ' + flags + ' ' + d.diag1.source.x + ',' + d.diag1.source.y;

                            return pathString;
                        })
                        .style('stroke', '#000000')
                        .style('stroke-opacity', 0)
                        .style('fill', function(d) {
                            return colors(depth);
                        })
                        .style('fill-opacity', opacities.linkOpacity);
                });

        });
}

/**
 * For a given BiLink object,
 * create a chords object from d3.layout.chord().
 * The chords contains angular data for each chord
 * such as "startAngle" and "endAngle".
 */
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

/**
 * Animate and highlight corresponding circle, chord and links
 */
function highlightCircle(circle, svg, opacities, on) {
    var gContext = d3.select(circle.parentNode);
    var circleContextId = gContext.attr('id').substr(3);

    // find all svg path element that is a link
    var links = svg.selectAll('path').filter(function(d, i) {
        // only if path contains diagData
        if (d.diag1 && d.diag2) {
            return d.contextId == circleContextId;
        }
        return false;
    });

    // animate links
    links.transition(on ? 150 : 550)
        .style('fill-opacity', on ? opacities.linkOpacity * 4 : opacities.linkOpacity)
        .style('stroke-opacity', on ? 0.5 : 0);

    // animate chord
    links.each(function(d, i) {
        var g = d3.select(this.parentNode);
        var spaceId = g.attr('spaceId');
        var contextId = g.attr('contextId');

        svg.select('#' + contextId)
            .selectAll('g.arcs g')
            .filter(function(d) {
                return d.id == spaceId;
            })
            .selectAll('path').transition(on ? 150 : 550)
            .style('fill-opacity', on ? opacities.chordOpacity * 4 : opacities.chordOpacity);
    });

    // animate context
    d3.select(circle).transition(on ? 150 : 550)
        .style('fill-opacity', on ? 1 : opacities.contextOpacity);

    // animate text
    gContext.selectAll('text').transition(on ? 150 : 550)
        .style('fill-opacity', on ? 1 : opacities.textOpacity);
}

/**
 * Zoom in or out.
 * Triggered when a circle is clicked.
 */
function zoom(svg, d) {
    //d : cercle sur lequel on a cliqué
    svg.transition()
        .duration(1000)
        .attr('viewBox', (d.x - d.r) + ' ' + (d.y - d.r) + ' ' + (d.r * 2) + ' ' + (d.r * 2));
    return;

    /*var radius = 600;

    var x = d3.scale.linear().range([0, radius]);
    var y = d3.scale.linear().range([0, radius]);

    var r = 600;

    var k = r / d.r / 2; // facteur de zoom (diamètre du cercle par rapport à la taille de l'écran)

    // domain : définit les fonctions x et y qui retournent position d'un point une fois qu'on applique le zoom
    // on passe les bornes de l'élément qu'on veut mettre en plein écran
    x.domain([d.x - d.r, d.x + d.r]);
    y.domain([d.y - d.r, d.y + d.r]);



    // transition progressive
    var t = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750);

    // on récupère tous les cercles
    t.selectAll('circle')
        // on fait varier les coordonnées du cercle avec la fonction x (d est le centre de l'élément à bouger)
        .attr('cx', function(d) {
            return x(d.x);
        })
        .attr('cy', function(d) {
            return y(d.y);
        })
        // on fait varier le rayon par rapport au facteur de zoom
        .attr('r', function(d) {
            return k * d.r;
        });

    // on récupère les champs de texte
    t.selectAll('text')
        // variation des coordonnées
        .attr('x', function(d) {
            return x(d.x);
        })
        .attr('y', function(d) {
            return y(d.y);
        })
        // variation de l'opacité : si le texte a une taille supérieure à 20 on l'affiche, sinon on le masque
        .style('opacity', function(d) {
            return k * d.r > 20 ? 1 : 0;
        });

    d3.event.stopPropagation();*/
}
