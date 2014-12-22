fetchData();

var intervalId;
var counter = 2;

function initialize() {
    // build a d3js root
    var root = {
        children: agentsModel
    };

    // populate bubble layout with root
    nodes = bubble.nodes(root);

    nodes.forEach(function (d) {
        if (d.depth == 1) {
            nodesById[d.CAND_ID] = d;
            d.relatedLinks = [];
            d.Amount = Number(d.Amount);
            d.currentAmount = d.Amount;

            agents.push(d);
        }
    });

    buildChords();

    inclusions.forEach(function (d) {
        nodesById[d.CAND_ID].relatedLinks.push(d);
        chordsById[d.CMTE_ID].relatedLinks.push(d);
    });

    log("initialize()");

}


function main() {
    initialize();
    updateNodes();
    updateChords();
    //  updateLinks(inclusions);
    intervalId = setInterval(onInterval, 1);
}

function onInterval() {
    if (inclusions.length == 0) {
        clearInterval(intervalId);
    }
    else {
        // renderLinks=[];
        for (var i = 0; i < counter; i++) {
            if (inclusions.length > 0) {
                renderLinks.push(inclusions.pop());
            }
        }
        counter = 30;
        //counter++;
        updateLinks(renderLinks);
    }
}