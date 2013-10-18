(function(){



    var EZFileHandler = function(callback_fn, btn_id, label_id) {
        this.callback = callback_fn;
        this.btn = $(btn_id).get(0);
        this.lbl = $(label_id);
        var that = this;

        if (this.btn && this.lbl) {
            this.btn.addEventListener('change', function (evt) {
                var label = "";
                _.each(that.btn.files, function(file) {
                    label += _.template('<span><%= name %> [<%= size %> bytes]</span>', file);
                });
                that.lbl.html(label);
            }, false);            
        }

    };


    EZFileHandler.prototype.handle = function(file_input, cb2) {
        var that = this;
        _.each(file_input.files, function(file, idx, all) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(evt) {
                that.callback(evt.target.result);
            };
            reader.onerror = function(evt) {
                console.log(evt);
            }
        });
        if (cb2) {
            cb2();
        }
    };


    function processEZFile(json_str) {
        var json_obj = JSON.parse(json_str);
        console.log(json_obj);

        if (json_obj.format && json_obj.format === "ezjson") {

            var records = json_obj.documents || [];
            _.each(records, function (rec){
                var entry;
                if (rec.id) {
                    entry = Items.findWhere({id:rec.id});
                    if (entry != null) {
                        entry.save(rec);
                        return;
                    }
                }
                entry = Items.create(rec);
                entry.save();
            });
        }
    }

    

    var Importer = Backbone.View.extend({
                tagName: 'div',
                render: function () {
                    var view = this;
                    var template = _.template($('#import-template').html(), {});
                    this.$el.html(template);
                    $('#dialogContainer').append(this.el);
                    this.$el.dialog({
                        autoOpen: true,
                        title: $('#import-template').attr('data-dialog-title'),
                        width: 410,
                        modal: true,
                        position: {my:'top',at:'top',of:'.page'},
                        close: function (event, ui) {
                            $(this).dialog('destroy').remove();
                            view.remove();
                        }
                    });
                    this.$el.find("#importHelp").button({
                        icons: {
                            primary: "ui-icon-help"
                        },
                        text: false
                    });

                    this.fileProcessor = new EZFileHandler(processEZFile, "#jsonFile", "#importLabel");
                },
                events: {
                    'click #ImportCancel': 'cancel',
                    'click #ImportData': 'load',
                    'click #importHelp': 'help'
                },
                cancel: function (event) {
                    event.preventDefault();
                    this.$el.dialog('close');
                },
                load: function(event) {
                    event.preventDefault();
                    console.log("Hi");
                    var view = this;
                    var btn = $(event.target);
                    this.fileProcessor.handle($(btn.attr("data-file")).get(0), function() {
                        view.$el.dialog('close');
                    });
                },
                help: function (event) {
                    event.preventDefault();
                    new Help().render();
                }
            });
   
    exports.Importer = Importer;

})();