(function(){
    var Standards = Backbone.View.extend({
        options: {
            fieldInfo: {},
            copyData: true
        },
        tagName: "fieldset",
        events: {
            'click button.std-add': 'addStandard',
            'change select.collections': 'changeStandard'
        },
        render: function() {
            var that = this;   

            this.$el.html(this.template({}));

            var std_options =  [
                {
                    label: "Common Core State Standards for English Language Arts",
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

            
            _.each(align_options, function(opt) {
                var newopt = $('<option>', opt);
                this.input.append(newopt);
            }, {input: this.alignmentType});

            this.$el.find("button.std-add").button({
                            icons: {
                                secondary: "ui-icon-plus",
                            }
                        });

            // Setup existing alignments.
            this.alignmentInputs = {};
            _.each(this.options.fieldInfo, function(fieldWrapper){
                var newField = that._addAlignmentField(fieldWrapper.name, fieldWrapper.cat_val, that.alignmentInputs, that);
                if (this.copyData)
                    var oldVals = fieldWrapper.input.val();
                fieldWrapper.input = newField;
                if (this.copyData)
                    fieldWrapper.value(oldVals);
            }, {copyData: this.options.copyData});
            
            this.$el.find(".multi-choice").trigger("chosen:updated");

            return this;

        },
        _addAlignmentField: function(englishTitle, alignType, inputs, that) {
            if (!inputs[alignType]) {
                var sect = _.template($('#alignment-template').html(), 
                    {
                        name: "alignmentType_"+alignType,
                        title: englishTitle
                    });
                that.$('.selected-alignments').append(sect);
                that.$(".multi-choice").chosen({width:"375px"});
                inputs[alignType] = that.$("#alignmentType_"+alignType);
            }
            return inputs[alignType];
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
                if (node.isSelected())
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