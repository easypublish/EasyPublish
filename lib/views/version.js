(function(){


    var Version = Backbone.View.extend({
        tagName: 'div',
        events: {
            'click button.git-uncommitted': 'toggleUncommitted'
        },
        render: function () {
            var view = this;
            
            $.ajax("ddoc", {
                success: function(data) {
                    var template = _.template($('#version-info-template').html(), {kanso: data});
                    view.$el.html(template);
                    $('#version-info').html(view.$el);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                }
            })

            
            
        },
        toggleUncommitted: function(event) {
            event.preventDefault();
            $("div.git-uncommitted").toggle();
        }

    });

    exports.Version = Version;

})();