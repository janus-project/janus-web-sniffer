function node_onMouseOver(d, type) {
    if (type == "CAND") {
        if (d.depth < 1) return;
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");

        header1.text("Congress");
        header.text(d.CAND_NAME);
        header2.text("Total Recieved: " + formatCurrency(Number(d.Amount)));
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height", "100px");

        highlightLinks(d, true);
    }
    else if (type == "CONTRIBUTION") {

        /*
         Highlight chord stroke
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");

        header1.text(spaceById[d.CMTE_ID].CMTE_NM);
        header.text(d.CAND_NAME);
        header2.text(formatCurrency(Number(d.TRANSACTION_AMT)) + " on " + d.Month + "/" + d.Day + "/" + d.Year);
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height", "100px");
        highlightLink(d, true);
    }
    else if (type == "PAC") {
        /*
         highlight all inclusions and all candidates
         */
        toolTip.transition()
            .duration(200)
            .style("opacity", ".9");

        header1.text("Political Action Committee");
        header.text(spaceById[d.label].CMTE_NM);
        header2.text("Total Contributions: " + formatCurrency(spaceById[d.label].Amount));
        toolTip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 75) + "px")
            .style("height", "110px");
        highlightLinks(chordsById[d.label], true);
    }
}

function node_onMouseOut(d, type) {
    if (type == "CAND") {
        highlightLinks(d, false);
    }
    else if (type == "CONTRIBUTION") {
        highlightLink(d, false);
    }
    else if (type == "PAC") {
        highlightLinks(chordsById[d.label], false);
    }


    toolTip.transition()									// declare the transition properties to fade-out the div
        .duration(500)									// it shall take 500ms
        .style("opacity", "0");							// and go all the way to an opacity of nil

}

function highlightLink(g, on) {

    var opacity = ((on == true) ? .6 : .1);

    // console.log("fadeHandler(" + opacity + ")");
    // highlightSvg.style("opacity",opacity);

    var link = d3.select(document.getElementById("l_" + g.Key));
    link.transition((on == true) ? 150 : 550)
        .style("fill-opacity", opacity)
        .style("stroke-opacity", opacity);

    var arc = d3.select(document.getElementById("a_" + g.Key));
    arc.transition().style("fill-opacity", (on == true) ? opacity : .2);

    var circ = d3.select(document.getElementById("c_" + g.CAND_ID));
    circ.transition((on == true) ? 150 : 550)
        .style("opacity", ((on == true) ? 1 : 0));

    var text = d3.select(document.getElementById("t_" + g.CMTE_ID));
    text.transition((on == true) ? 0 : 550)
        .style("fill", (on == true) ? "#000" : "#777")
        .style("font-size", (on == true) ? "10px" : "8px")
        .style("stroke-width", ((on == true) ? 2 : 0));

}

function highlightLinks(d, on) {

    d.relatedLinks.forEach(function (d) {
        highlightLink(d, on);
    })

}