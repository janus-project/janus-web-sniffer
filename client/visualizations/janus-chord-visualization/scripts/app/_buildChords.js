function buildChords() {

    var matrix = [];

    labels = [];
    chords = [];

    indexByName = [];
    nameByIndex = [];

    // create empty labels and chords
    spaces.forEach(function(el, index) {
        var l = {
            index: index,
            label: "null",
            angle: 0
        };
        labels.push(l);

        var c = {
            label: "null",
            source: {},
            target: {}
        };
        chords.push(c);
    });

    var totalPacAmount = 0;

    // Compute a unique index for each package name
    var n = 0;
    spaces.forEach(function (d) {
        d = d.CMTE_ID;
        if (!(d in indexByName)) {
            nameByIndex[n] = d;
            indexByName[d] = n++;
        }
    });

    // build the matrix
    spaces.forEach(function (d) {
        var source = indexByName[d.CMTE_ID],
            row = matrix[source];

        // fill zeroes in empty row
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }

        // relationship value
        var dest = indexByName[d.CMTE_ID];
        row[dest] = Number(d.Amount);
        totalPacAmount += Number(d.Amount);
        //  console.log("totalPacAmount=" + totalPacAmount)
    });

    // set chord's matrix and compute chords
    chord.matrix(matrix);

    // get chords
    chords = chord.chords();

    //
    chords.forEach(function (d, index) {
        d.label = nameByIndex[index];
        d.angle = (d.source.startAngle + d.source.endAngle) / 2
        var o = {
            startAngle: d.source.startAngle,
            endAngle: d.source.endAngle,
            index: d.source.index,
            value: d.source.value,
            currentAngle: d.source.startAngle,
            currentLinkAngle: d.source.startAngle,
            Amount: d.source.value,
            source: d.source,
            relatedLinks: []
        };
        chordsById[d.label] = o;
    });

    function getFirstIndex(index, indexes) {
        for (var i = 0; i < chordCount; i++) {
            var found = false;
            for (var y = index; y < indexes.length; y++) {
                if (i == indexes[y]) {
                    found = true;
                }
            }
            if (found == false) {
                return i;
                //  break;
            }
        }
        //      console.log("no available indexes");
    }

    function getLabelIndex(name) {
        for (var i = 0; i < chordCount; i++) {
            if (buffer[i].label == name) {
                return i;
                //   break;
            }
        }
        return -1;
    }

    log("buildChords()");
}

