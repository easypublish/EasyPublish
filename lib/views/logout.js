(function(){
	var Logout = Backbone.View.extend({
		el: '.page',
		render: function () {
			$.couch.browserid.logout();
		}
	});


	exports.Logout = Logout;
})();