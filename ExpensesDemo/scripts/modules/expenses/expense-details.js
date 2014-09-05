(function (global) {
	var ExpenseDetailsViewModel,
		ExpenseDetailsService,
        app = global.app = global.app || {};

	ExpenseDetailsViewModel = kendo.data.ObservableObject.extend({
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
            approveExpense: "approveExpense"
        },
        
		init: function () {
			var that = this;
            
			kendo.data.ObservableObject.fn.init.apply(that, arguments);
        },
        
        onApproveExpenseClick: function() {
            var that = this;
            
            that.trigger(that.events.approveExpense, {});
        }
	});

	ExpenseDetailsService = kendo.Class.extend({
        viewModel: null,
        view: "",
        
		init: function () {
			var that = this;

			that.viewModel = new ExpenseDetailsViewModel();
            that._bindToEvents();
            
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _bindToEvents: function() {
			var that = this;
            
            that.viewModel.bind(that.viewModel.events.approveExpense, $.proxy(that.onApproveExpense, that));
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

            app.sharepointService.getListItemById("Expenses",dataId,  $.proxy(that.setData, that),  $.proxy(that.onError, that));
             
            that.viewModel.$view = $(that.viewModel.viewId);
        },

		setData: function (expenseData) {
			var that = this,
                expenseData = expenseData.d;

            that.viewModel.set("Title", expenseData.Title);
            that.viewModel.set("Description", expenseData.Description);
            that.viewModel.set("Amount", expenseData.Amount);
            that.viewModel.set("Approved", expenseData.Approved);
            that.viewModel.set("Etag", expenseData.__metadata.etag);
            that.viewModel.set("Uri", expenseData.__metadata.uri);
            //that.viewModel.set("parentClass",  "ds-icon ds-icon-" + expenseData.Type.Icon);
            //that.viewModel.set("innerClass", "fa " + expenseData.Type.Icon);
            //that.viewModel.set("color", expenseData.Type.Color);

			app.common.hideLoading();
		},
        
        onApproveExpense: function() {
            var that = this;
            
            app.common.showLoading("Approval proceeding. This might take a couple of minutes");
            
            var updateExpense = {
                "Approved": true,
                "__metadata": { 'type': 'SP.Data.ExpensesListItem' }
            }
            
            $.ajax({
                url: that.viewModel.get("Uri"),
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify(updateExpense),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Authorization": "Basic " + localStorage.getItem("userAuthHash"),
                    "X-HTTP-Method": "MERGE",
                    "X-RequestDigest" : localStorage.getItem("formDigestValue"),
                    "If-Match": that.viewModel.get("Etag")
                },
                success: $.proxy(that.expenseApproved, that),
                error:that.onError
            });             
        },
        
        expenseApproved: function(data) {
            var that = this;
            //app.common.notification("Approval completed", "Approval completed");
            app.common.hideLoading();
            //that._showModule({ view: that.view } );
            //that.viewModel.set("Approved", true);
            app.common.navigateToView(app.config.views.expenses);
        },

		onError: function (e) {
			app.common.hideLoading();
			app.common.notification("Error", e.message);
		}
	});

	app.expenseDetailsService = new ExpenseDetailsService();
})(window);
