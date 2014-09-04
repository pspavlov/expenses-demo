(function (global) {
	var SettingsService,
        SettingsViewModel,
        app = global.app = global.app || {};
    
	SettingsViewModel = kendo.data.ObservableObject.extend({
        loggedIn: false,
        
        events: {
            logout: "logout"
        },
        
        
        onLogout: function() {
            var that = this;
            
            that.trigger(that.events.logout);
        }
	});
    
	SettingsService = kendo.Class.extend({
		viewModel: null,
        logged: false,
        consts: {
            localStorageKeyUsername: "dubaiServicesUsername",
            localStorageKeyPassword: "dubaiServicesPassword",
            localStorageKeyId: "dubaiServicesId"
        },
        
		init: function () {
			var that = this;

			that.viewModel = new SettingsViewModel();
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},   

		_initModule: function () {
			var that = this;
            
            that._bindToEvents();
		},
        
        _showModule: function() {
            var that = this;
            
            that.viewModel.$view = $(that.viewModel.viewId);
            that.viewModel.set("loggedIn", that.isLogged() !== null);
        },
        
        
        _bindToEvents: function() {
            var that = this;
            
            that.viewModel.bind(that.viewModel.events.logout, $.proxy(that.onLogout, that));
        }, 
        
        onLogout: function() {
           app.loginService.signInViewModel.logout(); 
        },
        
        setUserCredentials: function(username, password, id, token) {
            localStorage.setItem("accessToken", token);
            localStorage.setItem(this.consts.localStorageKeyUsername, username);
            localStorage.setItem(this.consts.localStorageKeyPassword, password);
            localStorage.setItem(this.consts.localStorageKeyId, id);
        },        
        
        
        isLogged: function() {
        	return localStorage.getItem("accessToken");
        },
        
        removeCredentials: function() {
         	localStorage.clear();   
        }
	});
    
	app.settingsService = new SettingsService();
})(window);