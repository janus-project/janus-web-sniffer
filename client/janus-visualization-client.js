var Interactions = new Meteor.Collection("janus_event_dispatches");
var InteractionsTable = new Meteor.Collection("janus_event_visualization");

/* construct visualizations with their respective svg ids */
jtv = new JanusTreeVisualization("#janus-tree");
jmv = new JanusMatrixVisualization("#janus-matrix");
jcv = new JanusCirclePackVisualization("#janus-circle-pack");
jchv = new JanusChordVisualization("#janus-chords");
jtm = new JanusTreeMapVisualization("#janus-treemap");


visualizations = new Array();

/* add all the visualizations */ 
visualizations.push(jtv);
visualizations.push(jmv);
visualizations.push(jcv);
visualizations.push(jchv);
visualizations.push(jtm);

/* handled when a change is observed in the collection */
Interactions.find({}).observeChanges({
    added: function(id, interaction) {
        for(var i in visualizations) {
            v = visualizations[i];
            // add a new interaction
            v.addInteraction(interaction);
            // update display
            v.update();
        }
    }
});

Template.interactions_list.interactions = function() {
    return Interactions.find({});
};

Template.interactions_list.rendered = function () {
    if(!this._rendered) {
        this._rendered = true;

        var interactions = Interactions.find({}).fetch();

        for(var i = 0; i < interactions.length; ++i) {
            for(var j in visualizations) {
                visualizations[j].addInteraction(interactions[i]);
            }
        }

        for(var i in visualizations) {
            v = visualizations[i];
            v.build();
            v.update();
        }
    }
};

Template.interactions_list_array.interactions = function() {
    return InteractionsTable.find({});
}

$(document).ready(function(){
    $('#janus-tree-visualization').hide();
    $('#janus-matrix-visualization').hide();
    $('#janus-circle-pack-visualization').hide();
    $('#janus-chords-visualization').hide();
    $('#janus-treemap-visualization').hide();
    $('#legend').hide();
    $('#button').hide();


    $(function() {
       $('#display_tree').click(function() {
           display('#janus-tree-visualization');
           return false;
       });        
   });

    $(function() {
       $('#display_matrix').click(function() {
           display('#janus-matrix-visualization');
           return false;
       });        
   });

    $(function() {
       $('#display_circle').click(function() {
           display('#janus-circle-pack-visualization');
           return false;
       });        
   });

   
   $(function() {
       $('#display_chords').click(function() {
           display('#janus-chords-visualization');
           return false;
       });        
   });

    $(function() {
       $('#display_treemap').click(function() {
           display('#janus-treemap-visualization');
           display('#legend');
           display('#button');

           return false;
       });        
   });
});

function display(div) {
    if($(div).is(':visible')) {
        $(div).fadeToggle('fast');
    } else {
        $(div).show("slow");
    }
}
