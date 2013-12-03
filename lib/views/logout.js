(function(){
	var Logout = Backbone.View.extend({
		el: '.page',
        options: {
            cleanup: false
        },
		render: function () {
			$.couch.browserid.logout();

            if (this.options.cleanup) {
                this.options.cleanup();
            }
		}
	});


	exports.Logout = Logout;
})();