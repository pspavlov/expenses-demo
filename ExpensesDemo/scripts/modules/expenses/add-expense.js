(function (global) {
	var AddExpenseViewModel,
        AddExpenseService,
        app = global.app = global.app || {};
    
	AddExpenseViewModel = kendo.data.ObservableObject.extend({
        viewId: "#add-bill-view",
        
        events: {
            addExpense: "addExpense"  
        },
        
		init: function () {
			var that = this;

			kendo.data.ObservableObject.fn.init.apply(that, that);
		},
        
        onAdd: function() {
            var that = this;
            
            that.trigger(that.events.addExpense);
        }
	});


	AddExpenseService = kendo.Class.extend({
		viewModel: null,

		init: function () {
			var that = this;

			that.viewModel = new AddExpenseViewModel();
            
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _bindToEvents: function() {
          	var that = this;
            
            that.viewModel.bind(that.viewModel.events.addExpense, $.proxy(that._onAddExpense, that));
        },
        
        _onAddExpense: function() {
            var that = this,
            newExpense = {
                "Title": that.viewModel.get("Title"),
                "Description": that.viewModel.get("Description"),
                "Amount": that.viewModel.get("Amount"),
                "Approved": false,
                "__metadata": { 'type': 'SP.Data.ExpensesListItem' }
            }
            
            app.common.showLoading();
            app.sharepointService.createListItem("Expenses",newExpense,  $.proxy(that._addExpenseCompleted, that), $.proxy(that._onError, that, ""));
        },
         _onError: function (provider, e) {
            app.common.hideLoading();
            app.common.notification("Error while adding expense", JSON.stringify(e));
        },
        
        _addExpenseCompleted: function() {
            app.common.hideLoading();
            app.common.navigateToView(app.config.views.expenses);
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
    
	app.addExpenseService = new AddExpenseService();
})(window);
