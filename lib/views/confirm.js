(function(){
    var Confirm = Backbone.View.extend({
        tagName: 'div',
        options: {
            confirm_cb: null,
            msg: null,
            title: null,
            btn_yes: "Yes",
            btn_no: "No",
            template_selector: "#confirm-template"
        },
        render: function() {
            var view = this;
            var temp_obj = $(this.options.template_selector);
            var template = _.template(temp_obj.html(), 
                {
                    message:this.options.msg, 
                    yes:this.options.btn_yes, 
                    no:this.options.btn_no
                });
            this.$el.html(template);
            
            $('#dialogContainer').append(this.el)
            this.$el.dialog({
                autoOpen: true,
                title: this.options.title || temp_obj.attr('data-dialog-title'),
                width: 410,
                modal: true,
                position: {my:'top', at:'top',of:'.page'},
                close: function(event, ui) {
                    $(this).dialog('destroy').remove();
                    view.options.confirm_cb("close");
                    view.remove();   
                }
            });
        },
        events: {
            'click .confirm-answer': 'confirm',
        },
        confirm: function(event) {
            event.preventDefault();
            var btn = $(event.target);
            if (this.options.confirm_cb)
                this.options.confirm_cb(btn.attr('data-value'));
            this.$el.dialog('close');
            this.remove();
        }

    });

    exports.Confirm = Confirm;

})();