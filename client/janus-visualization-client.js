var Interactions = new Meteor.Collection("janus_event_dispatches");
var InteractionsTable = new Meteor.Collection("janus_event_visualization");

/* construct visualizations with their respective svg ids */
jtv = new JanusTreeVisualization("#janus-tree");
jmv = new JanusMatrixVisualization("#janus-matrix");
jcv = new JanusCirclePackVisualization("#janus-circle-pack");

visualizations = new Array();

/* add all the visualizations */ 
visualizations.push(jtv);
visualizations.push(jmv);
visualizations.push(jcv);

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