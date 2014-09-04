(function (global) {
	var SettingsService,
        SettingsViewModel,
        app = global.app = global.app || {};
    
	SettingsViewModel = kendo.data.ObservableObject.extend({
        selectedLanguage: "",
        isEn: true,
        loggedIn: false,
        
        events: {
            languageUpdate: "languageUpdate",
            logout: "logout"
        },
        
        onLanguageSelectEN: function() {
            var that = this;
            
            that.trigger(that.events.languageUpdate, { lang: "en" });
        },
        
        onLanguageSelectAR: function() {
            var that = this;
            
            that.trigger(that.events.languageUpdate, { lang: "ar" });
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
            localStorageKeyLang: "dubaiServicesLanguage",
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
            
        	that.viewModel.set("selectedLanguage", that.getLanguage());
            that._bindToEvents();
		},
        
        _showModule: function() {
            var that = this,
                language = app.settingsService.getLanguage();
            
            that.viewModel.$view = $(that.viewModel.viewId);
            that.viewModel.$view.removeClass("en ar").addClass(language);
            that.viewModel.set("isEn", language === "en");
            that.viewModel.set("loggedIn", that.isLogged() !== null);
        },
        
        
        _bindToEvents: function() {
            var that = this;
            
			that.viewModel.bind(that.viewModel.events.languageUpdate, $.proxy(that.setLanguage, that));
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
        
        getLanguage: function() {
            return localStorage.getItem(this.consts.localStorageKeyLang) || "en";
        },
        
        setLanguage: function(data) {
            localStorage.setItem(this.consts.localStorageKeyLang, data.lang);
            
            app.analytics.Monitor().TrackFeature("Settings.Language - " + data.lang);
            app.analytics.Monitor().ForceSync();
            
            if(app.settingsService.isLogged()) {
                app.common.navigateToView(app.config.views.dashboard);
            } else {
                app.common.navigateToView(app.config.views.signIn);
            }
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