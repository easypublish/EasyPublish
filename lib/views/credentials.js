(function(){
	// Views
	var Credentials = Backbone.View.extend({
		el: '.page',
		render: function () {
			var cred = require("lib/credentials");

			if (storedCredentials) {
				$('#main-nav .signed-in').show();
				router.navigate('', {trigger:true});
			} else {
				var template = _.template($('#credentials-template').html());
				this.$el.html(template);

				/*
				var loginWidget = this.$el.find('#browserid .login');
				var icon = loginWidget.find('> img');
				if (icon.is(':hidden')) {
					// login widget setup only runs once on page load, set it back up after logout
					loginWidget.show().removeClass('pending');
					icon.show();

					$('#browserid .picture').empty();
					loginWidget.find('span').remove();
					loginWidget.find('a.logout').remove();

					loginWidget.addClass("clickable");
					loginWidget.click(function() {
						$.couch.browserid.login();
					});
				}
				*/

				cred.configureAjaxOptions();
    			cred.buildProviderLinks();
    			cred.checkCurrentSession();
			}

		}
	});

	exports.Credentials = Credentials;

})();