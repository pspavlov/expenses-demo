(function (global) {
	var AddBillViewModel,
        AddBillService,
        app = global.app = global.app || {};
    
	AddBillViewModel = kendo.data.ObservableObject.extend({
        viewId: "#add-bill-view",
		typesDataSource: null,
        isEn: true,
        account: "",
        name: "Electricity",
        typeId: "068b6250-01d4-11e4-9a31-072b789b32f1",
        
        events: {
            addBill: "addBill"  
        },
        
		init: function () {
			var that = this;

            that.typesDataSource = new kendo.data.DataSource({ pageSize: 10 });
            
			kendo.data.ObservableObject.fn.init.apply(that, that);
		},
        
        onTypeChange: function(e) {
           var that = this;
            
           that.set("name", e.item.text().trim());
           that.set("typeId", that.typesDataSource.getByUid(e.item.data().uid).Id);
        },
        
        onAdd: function() {
            var that = this;
            
            that.trigger(that.events.addBill);
        }
	});


	AddBillService = kendo.Class.extend({
		viewModel: null,
        
        expandExp: {
            "History": true,
            "Type": true,
        },

		init: function () {
			var that = this;

			that.viewModel = new AddBillViewModel();
            
			that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
		},
        
        _bindToEvents: function() {
          	var that = this;
            
            that.viewModel.bind(that.viewModel.events.addBill, $.proxy(that._onAddBill, that));
        },
        
        _onAddBill: function() {
            var that = this,
                newBill = {
                "Account": that.viewModel.get("account"),
                "Title": that.viewModel.get("name"),
                "Title_ar": that.viewModel.get("name"),
                "Type": that.viewModel.get("typeId")
            }
            
            app.common.showLoading();
            
            return app.everlive.data("Bill").create(newBill)
                .then($.proxy(that._addBillCompleted, that));
        },
        
        _addBillCompleted: function() {
            app.common.hideLoading();
            app.common.navigateToView(app.config.views.bills);
        },

		_initModule: function () {
			var that = this;

            app.common.showLoading();
            
            that._bindToEvents();
			that.getBillsData();
		},
        
        _showModule: function(e) {
            var that = this,
            	language = app.settingsService.getLanguage(),
            	scroller = e.view.scroller;
            
            scroller.reset();
            
            that.viewModel.$view = $(that.viewModel.viewId);
            that.viewModel.$view.removeClass("en ar").addClass(language);
            that.viewModel.set("isEn", language === "en");
        },

		getBillsData: function () {
            var that = this;
            
            return app.everlive.data("BillTypes").get()
                .then($.proxy(that.storeTypes, that));
		},
        
        storeTypes: function(data) {
            var that = this,
                types = data.result,
                isEn = that.viewModel.get("isEn");
            
            for(var i = 0, l = types.length; i < l; i++) {
                types[i].isEn = isEn;
            }
            
            that.viewModel.get("typesDataSource").data(types);
            app.common.hideLoading();
        }
	});
    
	app.addBillService = new AddBillService();
})(window);
