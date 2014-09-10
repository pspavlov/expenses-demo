(function (global) {
	var claimDetailsViewModel,
		claimDetailsService,
        app = global.app = global.app || {};

	claimDetailsViewModel = kendo.data.ObservableObject.extend({
        ID: "",
        Title: "",
        parentClass: "",
        innerClass: "",
        color: "",
        viewId: "#bill-details-view",
        Description: "",
        Amount: 0,
        Approved: false,
        Etag: "",
        Uri: "",
        events: {
            approveclaim: "approveclaim"
        },
        
		init: function () {
			var that = this;
            
			kendo.data.ObservableObject.fn.init.apply(that, arguments);
        },
        
        onApproveclaimClick: function() {
            var that = this;
            
            that.trigger(that.events.approveclaim, {});
        }
	});

	claimDetailsService = kendo.Class.extend({
        viewModel: null,
        view: "",
        
		init: function () {
			var that = this;

			that.viewModel = new claimDetailsViewModel();
            that._bindToEvents();
            
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _bindToEvents: function() {
			var that = this;
            
            that.viewModel.bind(that.viewModel.events.approveclaim, $.proxy(that.onApproveclaim, that));
        },

		_initModule: function (e) {
		
		},
        
        _showModule: function(e) {
            var that = this,
				dataId = e.view.params.dataId,
            	scroller = e.view.scroller;

			if (!dataId) {
				return;
			}
            scroller.reset();
            
            that.view = e.view;
            
            app.common.showLoading();

            that.viewModel.set("ID", dataId);

            app.sharepointService.getListItemById("claims",dataId,  $.proxy(that.setData, that),  $.proxy(that.onError, that));
             
            that.viewModel.$view = $(that.viewModel.viewId);
        },

		setData: function (claimData) {
			var that = this,
                claimData = claimData.d;

            that.viewModel.set("Title", claimData.Title);
            that.viewModel.set("Description", claimData.Description);
            that.viewModel.set("Amount", claimData.Amount);
            that.viewModel.set("Approved", claimData.Approved);
            that.viewModel.set("Etag", claimData.__metadata.etag);
            that.viewModel.set("Uri", claimData.__metadata.uri);
            //that.viewModel.set("parentClass",  "ds-icon ds-icon-" + claimData.Type.Icon);
            //that.viewModel.set("innerClass", "fa " + claimData.Type.Icon);
            //that.viewModel.set("color", claimData.Type.Color);

			app.common.hideLoading();
		},
        
        onApproveclaim: function() {
            var that = this;
            
            app.common.showLoading("Approval proceeding. This might take a couple of minutes");
            
            var updateclaim = {
                "Approved": true,
                "__metadata": { 'type': 'SP.Data.claimsListItem' }
            }
            
            app.sharepointService.updateListItem ("claims",  that.viewModel.get("Etag"),that.viewModel.get("ID"), updateclaim, $.proxy(that.claimApproved, that), that.onError)
        },
        
        claimApproved: function(data) {
            var that = this;
            //app.common.notification("Approval completed", "Approval completed");
            app.common.hideLoading();
            //that._showModule({ view: that.view } );
            //that.viewModel.set("Approved", true);
            app.common.navigateToView(app.config.views.claims);
        },

		onError: function (e) {
			app.common.hideLoading();
			app.common.notification("Error", JSON.stringify(e));
		}
	});

	app.claimDetailsService = new claimDetailsService();
})(window);
