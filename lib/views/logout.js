(function(){
	var Logout = Backbone.View.extend({
		el: '.page',
        options: {
            cleanup: false
        },
		render: function () {
			var logoutUrl = app.config.authServerBaseUrl + '/logout';

            /* Logs out the current user from the Auth Server */
            $.get(logoutUrl, function () {
                router.navigate('#login', {trigger: true});
                window.location.reload();
            });

            if (this.options.cleanup) {
                this.options.cleanup();
            }
		}
	});

	exports.Logout = Logout;
})();