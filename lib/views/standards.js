(function(){
    var Standards = Backbone.View.extend({
        tagName: "fieldset",
        events: {
            'click button.std-add': 'addStandard',
            'change select.collections': 'changeStandard'
        },
        render: function() {
    
            this.$el.html(this.template({}));

            var std_options =  [
                {
                    label: "Common Core State Standards for English",
                    uri: "js/data/ccss_ela.json"
                },
                {
                    label: "Common Core State Standards for Math",
                    uri: "js/data/ccss_math.json"
                }
            ];
            var align_options = [
                {   
                    text:"Assesses",
                    value:"assesses"
                },
                {
                    text:"Teaches",
                    value:"teaches"
                },
                {
                    text:"Requires",  
                    value:"requires"  
                }];

            var collections = this.$('.collections');
            _.each(std_options, function(opt){
                var newopt = $('<option>', {
                    text: opt.label,
                    value: opt.uri
                });
                collections.append(newopt);
            });
            
            collections.val(std_options[0].uri);
 
            this.setStandard(std_options[0].uri);

            this.alignmentType = this.$('.alignmentType');

            this.alignmentInputs = {};
            _.each(align_options, function(opt) {
                var newopt = $('<option>', opt);
                this.input.append(newopt);
            }, {input: this.alignmentType});

            this.$el.find("button.std-add").button({
                            icons: {
                                secondary: "ui-icon-plus",
                            }
                        });

            return this;

        },
        template: function(attrib) {
            return _.template($('#standards-template').html(), attrib || {});
        },
        addStandard: function(event) {
            event.preventDefault();
            console.dir(this.getTree().getSelectedNodes());
            var that = this;
            _.each(this.getTree().getSelectedNodes(), function(node){
                if (node.data && node.data.dotnotation && node.key) {
                    if (!this.inputs[this.aligned.val()]) {
                        var sect = _.template($('#alignment-template').html(), 
                            {
                                name: "alignment_"+this.aligned.val(),
                                title: this.aligned.find('option[value="'+this.aligned.val()+'"]').html()
                            });
                        that.$('.selected-alignments').append(sect);
                        that.$(".multi-choice").chosen({width:"375px"});
                        this.inputs[this.aligned.val()] = that.$("#alignment_"+this.aligned.val());
                    }

                    var newopt = $('<option>', 
                    {
                        text: node.data.dotnotation,
                        value: node.key,
                        selected: true
                    });

                    this.inputs[this.aligned.val()].append(newopt);

                }
            }, { aligned: this.alignmentType, inputs: this.alignmentInputs});
            
            _.each(this.getTree().getSelectedNodes(), function(node){
                node.toggleSelected();
            });
            this.$(".multi-choice").trigger("chosen:updated");

        },
        changeStandard: function(event) {
            event.preventDefault();
            var uri = $(event.currentTarget).val();
            this.getTree().reload({url:uri});
            // this.setStandard(uri);
        },
        getTree: function() {
            return this.$(".std-tree").fancytree("getTree");
        },
        setStandard: function(source) {
            this.$(".std-tree").fancytree({
                source: { url: source },
                checkbox: true,
                icons: false,
                selectMode: 3,
            });
        }
    });

    exports.Standards = Standards;

})();