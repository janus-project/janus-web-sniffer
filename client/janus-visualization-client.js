var Interactions = new Meteor.Collection("janus_event_dispatches");

jtv = new JanusTreeVisualization();
jmv = new JanusMatrixVisualization();

Interactions.find({}).observeChanges({
    added: function(id, interaction) {
        jtv.addInteraction(interaction);
        jtv.update();

        jmv.addInteraction(interaction);
        jmv.update();
    }
});

Template.interactions_list.interactions = function() {
    return Interactions.find({});
};

Template.interactions_list.rendered = function () {
    if(!this._rendered) {
        this._rendered = true;

        var interactions = Interactions.find({}).fetch();
        jtv.interactions_count = interactions.length;

        for(var i = 0; i < interactions.length; ++i) {
            jtv.addInteraction(interactions[i]);
            jmv.addInteraction(interactions[i]);
        }

        jtv.build();
        jtv.update();

        jmv.build();
        jmv.update();
    }
};

Template.interactions_list_array.interactions = function() {
    return Interactions.find({});
}

Template.interactions_list.events({
    'click': function () {}
});
