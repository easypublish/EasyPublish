(function(){
    var Confirm = Backbone.View.extend({
        tagName: 'div',
        render: function(confirm_cb, msg, title, btn_yes, btn_no) {
            var view = this;
            var temp_obj = $('#confirm-template');
            var template = _.template(temp_obj.html(), {message:msg, yes:btn_yes, no:btn_no});
            this.$el.html(template);
            this.confirm_cb = confirm_cb;
            $('#dialogContainer').append(this.el)
            this.$el.dialog({
                autoOpen: true,
                title: title || temp_obj.attr('data-dialog-title'),
                width: 410,
                modal: true,
                position: {my:'top', at:'top',of:'.page'},
                close: function(event, ui) {
                    $(this).dialog('destroy').remove();
                    view.confirm_cb("close");
                    view.remove();   
                }
            });
        },
        events: {
            'click .confirm-answer': 'confirm',
        },
        confirm: function(event) {
            event.preventDefault();
            console.log("got here");
            var btn = $(event.target);
            if (this.confirm_cb)
                this.confirm_cb(btn.attr('data-value'));
            this.$el.dialog('close');
            this.remove();
        }

    });

    exports.Confirm = Confirm;

})();