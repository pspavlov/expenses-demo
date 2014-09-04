(function (global) {
	var DashBoardViewModel,
        DashBoardService,
        app = global.app = global.app || {};

	DashBoardViewModel = kendo.data.ObservableObject.extend({
        viewId: "#init-view, #dashboard-view",
        isEn: true,
        unreadNotifications: 0,
        hasUnread: false
	});

	DashBoardService = kendo.Class.extend({
		viewModel: null,
        
        init: function () {
			var that = this;

			that.viewModel = new DashBoardViewModel();
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _initModule: function () {
		},
        
        _showModule: function() {
            var that = this,
                language = app.settingsService.getLanguage();
            
            if(!app.settingsService.isLogged()) {
            	app.common.navigateToView(app.config.views.settingsStarting);
                return;
            }
            
            that.viewModel.$view = $(that.viewModel.viewId);
            that.viewModel.$view.removeClass("en ar").addClass(language);
            that.viewModel.set("isEn", language === "en");
            
            that.getNotifications();
        },
        
        getNotifications: function() {
            var that = this;
            
            return app.everlive.data("Notifications").count({Read: false})
                .then($.proxy(that.setNotificationsCount, that));
        },
 
        setNotificationsCount: function(res) {
            var that = this,
            	count = res.result;

			that.viewModel.set('hasUnread', count > 0);
            
            that.viewModel.set('unreadNotifications', count);
		}
	});

	app.dashBoardService = new DashBoardService();
})(window);
