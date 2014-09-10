(function (global) {
	var AddclaimViewModel,
        AddclaimService,
        app = global.app = global.app || {};
    
	AddclaimViewModel = kendo.data.ObservableObject.extend({
        viewId: "#add-bill-view",
        
        events: {
            addclaim: "addclaim"  
        },
        
		init: function () {
			var that = this;

			kendo.data.ObservableObject.fn.init.apply(that, that);
		},
        
        onAdd: function() {
            var that = this;
            
            that.trigger(that.events.addclaim);
        }
	});


	AddclaimService = kendo.Class.extend({
		viewModel: null,

		init: function () {
			var that = this;

			that.viewModel = new AddclaimViewModel();
            
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _bindToEvents: function() {
          	var that = this;
            
            that.viewModel.bind(that.viewModel.events.addclaim, $.proxy(that._onAddclaim, that));
        },
        
        _onAddclaim: function() {
            var that = this,
            newclaim = {
                "Title": that.viewModel.get("Title"),
                "Description": that.viewModel.get("Description"),
                "Amount": that.viewModel.get("Amount"),
                "Approved": false,
                "__metadata": { 'type': 'SP.Data.claimsListItem' }
            }
            
            app.common.showLoading();
            app.sharepointService.createListItem("claims",newclaim,  $.proxy(that._addclaimCompleted, that), $.proxy(that._onError, that, ""));
        },
         _onError: function (provider, e) {
            app.common.hideLoading();
            app.common.notification("Error while adding claim", JSON.stringify(e));
        },
        
        _addclaimCompleted: function() {
            app.common.hideLoading();
            app.common.navigateToView(app.config.views.claims);
        }, 

		_initModule: function () {
			var that = this;

            that._bindToEvents();
		},
        
        _showModule: function(e) {
            var that = this,
            	scroller = e.view.scroller;
            
            scroller.reset();
            
            that.viewModel.$view = $(that.viewModel.viewId);
        },

       
	});
    
	app.addclaimService = new AddclaimService();
})(window);
