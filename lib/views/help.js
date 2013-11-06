(function(){
	var Help = Backbone.View.extend({
		tagName: 'div',
		render: function () {
			var view = this;
			var template = _.template($('#csv-help-template').html(), {});
			this.$el.html(template);
			$('#dialogContainer').append(this.el);
			this.$el.dialog({
				autoOpen: true,
				width: 410,
				position: {my:'top',at:'top',of:'.page'},
				modal:true,
				close: function (event, ui) {
					$(this).dialog('destroy').remove();
					view.remove();
				}
			});
		}
	});

	exports.Help = Help;

})();