(function(){
	exports.Notification = Backbone.View.extend({
		el: '#notification-area',
		initialize: function () {
			this.listenTo(Items, 'add', this.destroy);
			this.listenTo(Items, 'remove', this.destroy);
			this.listenTo(list, 'render', this.destroy);
		},
		render: function (total, errors) {
			var template = _.template($('#notification-template').html(), {total:total,errors:errors});
			this.$el.html(template);
		}
	});
})();