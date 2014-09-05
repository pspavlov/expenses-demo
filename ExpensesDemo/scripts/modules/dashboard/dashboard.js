(function (global) {
	var DashBoardViewModel,
        DashBoardService,
        app = global.app = global.app || {};

	DashBoardViewModel = kendo.data.ObservableObject.extend({
        viewId: "#init-view, #dashboard-view",
	});

	DashBoardService = kendo.Class.extend({
		viewModel: null,
        
        init: function () {
			var that = this;
			app.sharepointService.init();//zz
			that.viewModel = new DashBoardViewModel();
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _initModule: function () {
		},
        
        _showModule: function() {
            var that = this;
            
            if(!app.settingsService.isLogged()) {
            	app.common.navigateToView(app.config.views.signIn);
                return;
            }
            
            that.viewModel.$view = $(that.viewModel.viewId);
            
        }
	});

	app.dashBoardService = new DashBoardService();
})(window);
