function updateLinks(links) {

    linkGroup = linksSvg.selectAll("g.links")
        .data(links, function (d, i) {
            return d.Key;
        });

    //   linkGroup.selectAll("g.links").transition(500).style("opacity",1);

    var enter = linkGroup.enter().append("g").attr("class", "links");
    var update = linkGroup.transition();


    /*  ARC SEGMENTS */
    enter.append("g")
        .attr("class", "arc")
        .append("path")
        .attr("id", function (d) {
            return "a_" + d.Key;
        })
        .style("fill", function (d) {
            return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
        })
        .style("fill-opacity", .2)
        .attr("d", function (d, i) {
            var newArc = {};
            var relatedChord = chordsById[d.CMTE_ID];
            // console.log("CMTE_ID=" + d.CMTE_ID);
            newArc.startAngle = relatedChord.currentAngle;
            relatedChord.currentAngle = relatedChord.currentAngle + (Number(d.TRANSACTION_AMT) / relatedChord.value) * (relatedChord.endAngle - relatedChord.startAngle);
            newArc.endAngle = relatedChord.currentAngle;
            newArc.value = Number(d.TRANSACTION_AMT);
            var arc = d3.svg.arc(d, i).innerRadius(linkRadius).outerRadius(innerRadius);
            dynamicTotalAgents += newArc.value;
            total.text(formatCurrency(dynamicTotalAgents));

            return arc(newArc, i);
        })
        .on("mouseover", function (d) {
            node_onMouseOver(d, "CONTRIBUTION");
        })
        .on("mouseout", function (d) {
            node_onMouseOut(d, "CONTRIBUTION");
        });

    /* LINKS */
    enter.append("path")
        .attr("class", "link")
        .attr("id", function (d) {
            return "l_" + d.Key;
        })
        .attr("d", function (d, i) {
            d.links = createLinks(d);
            var diag = diagonal(d.links[0], i);
            diag += "L" + String(diagonal(d.links[1], i)).substr(1);
            diag += "A" + (linkRadius) + "," + (linkRadius) + " 0 0,0 " + d.links[0].source.x + "," + d.links[0].source.y;

            console.log(diag);
            return diag;
        })
        .style("stroke", function (d) {
            return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
        })
        .style("stroke-opacity", .07)
        // .style("stroke-width",function (d) { return d.links[0].strokeWeight;})
        .style("fill-opacity", 0.1)
        .style("fill", function (d) {
            return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
        })
        .on("mouseover", function (d) {
            node_onMouseOver(d, "CONTRIBUTION");
        })
        .on("mouseout", function (d) {
            node_onMouseOut(d, "CONTRIBUTION");
        });


    /* NODES */
    enter.append("g")
        .attr("class", "node")
        .append("circle")
        .style("fill", function (d) {
            return (d.PTY == "DEM") ? demColor : (d.PTY == "REP") ? repColor : otherColor;
        })
        .style("fill-opacity", 0.2)
        .style("stroke-opacity", 1)
        .attr("r", function (d) {
            var relatedNode = nodesById[d.CAND_ID];
            //Decrement Related Node
            relatedNode.currentAmount = relatedNode.currentAmount - Number(d.TRANSACTION_AMT);
            var ratio = ((relatedNode.Amount - relatedNode.currentAmount) / relatedNode.Amount);
            return relatedNode.r * ratio;
        })
        .attr("transform", function (d, i) {
            return "translate(" + (d.links[0].target.x) + "," + (d.links[0].target.y) + ")";
        })


    linkGroup.exit().remove();

    function createLinks(d) {
        var target = {};
        var source = {};
        var link = {};
        var link2 = {};
        var source2 = {};

        var relatedChord = chordsById[d.CMTE_ID];
        var relatedNode = nodesById[d.CAND_ID];
        var radius = linkRadius;
        //var currX = (radius * Math.cos(relatedChord.currentLinkAngle - Math.PI / 2));
        //var currY = (radius * Math.sin(relatedChord.currentLinkAngle - Math.PI / 2));

        var a = relatedChord.currentLinkAngle - Math.PI / 2; //-90 degrees
        relatedChord.currentLinkAngle += (Number(d.TRANSACTION_AMT) / relatedChord.value) * (relatedChord.endAngle - relatedChord.startAngle);
        var a1 = relatedChord.currentLinkAngle - Math.PI / 2;

        source.x = (radius * Math.cos(a));
        source.y = (radius * Math.sin(a));
        target.x = relatedNode.x - (chordsTranslate - nodesTranslate);
        target.y = relatedNode.y - (chordsTranslate - nodesTranslate);
        source2.x = (radius * Math.cos(a1));
        source2.y = (radius * Math.sin(a1));
        link.source = source;
        link.target = target;
        link2.source = target;
        link2.target = source2;

        //console.log('=======');
        //console.dir(d);
        //console.dir(relatedChord);
        //console.dir(link);
        //console.dir(link2);

        return [link, link2];
    }

    //   console.log("updateLinks()");

}

function updateNodes() {

    var node = nodesSvg.selectAll("g.node")
        .data(agents, function (d, i) {
            return d.CAND_ID;
        });

    var enter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    enter.append("circle")
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill-opacity", function (d) {
            return (d.depth < 2) ? 0 : 0.05
        })
        .style("stroke", function (d) {
            return ((d.PTY == 'DEM') ? demColor : (d.PTY == "REP") ? repColor : otherColor);
        })
        .style("stroke-opacity", function (d) {
            return (d.depth < 2) ? 0 : 0.2
        })
        .style("fill", function (d) {
            return ((d.PTY == 'DEM') ? demColor : (d.PTY == "REP") ? repColor : otherColor);
        });

    var g = enter.append("g")
        .attr("id", function (d) {
            return "c_" + d.CAND_ID;
        })
        .style("opacity", 0);

    g.append("circle")
        .attr("r", function (d) {
            return d.r + 2;
        })
        .style("fill-opacity", 0)
        .style("stroke", "#FFF")
        .style("stroke-width", 2.5)
        .style("stroke-opacity", .7);

    g.append("circle")
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill-opacity", 0)
        .style("stroke", "#000")
        .style("stroke-width", 1.5)
        .style("stroke-opacity", 1)
        .on("mouseover", function (d) {
            node_onMouseOver(d, "CAND");
        })
        .on("mouseout", function (d) {
            node_onMouseOut(d, "CAND");
        });

    node.exit().remove().transition(500).style("opacity", 0);

    log("updateBubble()");
}

function updateChords() {
    var arcGroup = chordsSvg.selectAll("g.arc")
        .data(chords, function (d) {
            return d.label;
        });

    var enter = arcGroup.enter().append("g").attr("class", "arc");

    enter.append("text")
        .attr("class", "chord")
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function (d) {
            return trimLabel(spaceById[d.label].CMTE_NM);
        })
        .on("mouseover", function (d) {
            node_onMouseOver(d, "PAC");
        })
        .on("mouseout", function (d) {
            node_onMouseOut(d, "PAC");
        });

    arcGroup.transition()
        .select("text")
        .attr("id", function (d) {
            return "t_" + d.label;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                + "translate(" + (innerRadius + 6) + ")"
                + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("fill", "#777")
        .text(function (d) {
            return trimLabel(spaceById[d.label].CMTE_NM);
        });

    enter.append("path")
        .style("fill-opacity", 0)
        .style("stroke", "#555")
        .style("stroke-opacity", 0.4)
        .attr("d", function (d, i) {
            var arc = d3.svg.arc(d, i).innerRadius(innerRadius - 20).outerRadius(innerRadius);
            return arc(d.source, i);
        });

    arcGroup.transition()
        .select("path")
        .attr("d", function (d, i) {
            var arc = d3.svg.arc(d, i).innerRadius(innerRadius - 20).outerRadius(innerRadius);
            return arc(d.source, i);
        });

    arcGroup.exit().remove();

    log("updateChords()");
}

function trimLabel(label) {
    if (label.length > 25) {
        return String(label).substr(0, 25) + "...";
    } else {
        return label;
    }
}

function getChordColor(i) {
    var country = nameByIndex[i];
    if (colorByName[country] == undefined) {
        colorByName[country] = fills(i);
    }

    return colorByName[country];
}


