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
        //events: {
        //    payBill: "payBill"
        //},
        
		init: function () {
			var that = this;
            
			kendo.data.ObservableObject.fn.init.apply(that, arguments);
        },
        
        //onPayBillClick: function() {
        //    var that = this;
            
        //    that.trigger(that.events.payBill, {});
        //}
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
            
            //that.viewModel.bind(that.viewModel.events.payBill, $.proxy(that.onPayBill, that));
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

            
             $.ajax({
                url: "http://enterprisepocs.cloudapp.net/_api/web/lists/getByTitle('Expenses')/items(" + dataId + ")",
                type: "GET",
                headers: {
                    "ACCEPT": "application/json;odata=verbose",
                    "Authorization": "Basic " + app.settingsService.getUserHash()
                },
                success: $.proxy(that.setData, that), 
                error:  $.proxy(that.onError, that),
                xhrFields: {
                    withCredentials: true
                },
                dataType: 'json',
                crossDomain: true
            });
            
            
            
            
			//app.everlive.data("Bill").expand(that.expandExp).getById(dataId)
            //    .then($.proxy(that.setData, that))
            //    .then(null, $.proxy(that.onError, that));
            
            that.viewModel.$view = $(that.viewModel.viewId);
        },

		setData: function (expenseData) {
			var that = this,
                expenseData = expenseData.d;

            that.viewModel.set("Title", expenseData.Title);
            that.viewModel.set("Description", expenseData.Description);
            that.viewModel.set("Amount", expenseData.Amount);
            that.viewModel.set("Approved", expenseData.Approved);
            //that.viewModel.set("parentClass",  "ds-icon ds-icon-" + expenseData.Type.Icon);
            //that.viewModel.set("innerClass", "fa " + expenseData.Type.Icon);
            //that.viewModel.set("color", expenseData.Type.Color);

			app.common.hideLoading();
		},
        
        //onPayBill: function() {
        //    var that = this;
            
        //    if(that.viewModel.get("isEn")) {
        //   		app.common.showLoading("Payment proceeding. This might take a couple of minutes");
        //    } else {
        //        app.common.showLoading("دفع الدعوى. وهذا قد يستغرق بضع دقائق");
        //    }
            
        //    //todo - create and pass DTO instead of viewModel
        //    app.paymentService.pay(that.viewModel)
        //    	.then($.proxy(that.paymentCompleted, that));       
        //},
        
        //paymentCompleted: function(data) {
        //    var that = this;
            
        //    if(data.state === "approved") {
        //        for (var i=0; i < that.paidBillHistories.length; i++) {
        //            app.everlive.data("BillHistory").updateSingle({Id:that.paidBillHistories[i], "Paid": true});
        //        }

        //        app.common.notification("Payment completed", "Payment Completed");
        //        app.common.hideLoading();
        //        that._showModule({ view: that.view } );
        //        that.viewModel.set("showPay", false);
        //    } else {
        //        app.common.notification("Payment Failed", "Payment Failed");
        //    }
        //},

		onError: function (e) {
			app.common.hideLoading();
			app.common.notification("Error", e.message);
		}
	});

	app.expenseDetailsService = new ExpenseDetailsService();
})(window);
