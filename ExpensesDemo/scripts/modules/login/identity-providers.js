(function (global) {
	var IdentityProvider,
		app = global.app = global.app || {};

	IdentityProvider = kendo.Class.extend({
		config: {},
		referenceWindow: null,

		init: function (config) {
			this.config = config;
		},

		getAccessToken: function (callback) {
			var that = this,
				authorize_url;

			authorize_url = that.config.endpoint
				+ "?response_type=" + that.config.responseType
				+ "&client_id=" + that.config.clientId
				+ "&redirect_uri=" + that.config.redirectUri
				+ "&display=" + that.config.display
				+ "&access_type=" + that.config.accessType
				+ "&scope=" + that.config.scope;

			//CALL IN APP BROWSER WITH THE LINK
			that.referenceWindow = window.open(authorize_url, "_blank", "location=no");

			that.referenceWindow.addEventListener("loadstop", function (event) {
				that._locationChanged(event.url, callback);
			});

			that.referenceWindow.addEventListener("exit", function () {
				callback("");
			});

			//The following is required in iPhone as the loadstop event is never fired. 
			that.referenceWindow.addEventListener("loadstart", function (event) {
				that._locationChanged(event.url, callback);
			});
		},

		_locationChanged: function (location, callback) {
			var that = this,
				token;

			if (location.indexOf("access_token=") !== -1) {
				this.referenceWindow.close();
				token = that._getParameterByName("access_token", location);
				callback(token);
			}
		},

		_getParameterByName: function (name, url) {
			var regexPattern = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]") + "=([^&#]*)",
				regex = new RegExp(regexPattern),
				results = regex.exec(url);

			if (results === null) {
				return false;
			} else {
				return decodeURIComponent(results[1].replace(/\+/g, " "));
			}
		},
	});

	app.IdentityProvider = IdentityProvider;
})(window);