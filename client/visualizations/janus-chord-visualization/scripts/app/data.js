/**
 *
 * DATA SOURCE:  http://www.fec.gov/data/index.jsp/
 *
 */

/**
 * Daisy Chain Data Fetches to ensure all data is loaded prior to updates (async calls)
 */

// var dataDispatch=d3.dispatch("end");
var dataCalls = [];
var numCalls = 0;

function fetchData() {
    dataCalls = [];
    addStream("data/agents.csv", onFetchAgents);
    addStream("data/inclusions.csv", onFetchInclusions);
    addStream("data/spaces.csv", onFetchSpaces);
    startFetch();
}

function onFetchAgents(csv) {
    csv.forEach(function (el) {
        el.value = Number(el.Amount);
        agentsModel.push(el);
        totalAgents += el.value;
    });

    log("onFetchAgents()");
    endFetch();
}

function onFetchInclusions(csv) {
    // generate a key used as id on svg tag
    csv.forEach(function (el, index) {
        el.Key = "I" + index;
        inclusions.push(el);
    });

    log("onFetchInclusions()");
    endFetch();
}

function onFetchSpaces(csv) {
    csv.forEach(function (el) {
        spaceById[el.CMTE_ID] = el;
        spaces.push(el);
    });

    log("onFetchSpaces()");
    endFetch();
}

function addStream(file, func) {
    dataCalls.push({
        file: file,
        function: func
    });
}

function startFetch() {
    numCalls = dataCalls.length;
    dataCalls.forEach(function (el) {
        d3.csv(el.file, el.function);
    })
}

function endFetch() {
    numCalls--;
    if (numCalls == 0) {
        main();
    }
}
