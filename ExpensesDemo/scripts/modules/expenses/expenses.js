(function (global) {
    var Bill,
        BillsViewModel,
        BillsService,
        app = global.app = global.app || {};

    app.newLeafData = app.newLeafData || {};

    Bill = kendo.data.ObservableObject.extend({
        id: null,
        title: "",
        title_ar: "",
        date: "N/A",
        cost: 0,
        icon: "",
        color: "",
        billClass: "",
        history: "",

        init: function (item) {
            var that = this;

            that.id = item.Id;

            if (item.Type) {
                that.icon = item.Type.Icon;
                that.color = item.Type.Color;
            }
            that.title = item.Title;
            that.title_ar = item.Title_ar;

            if (item.History.length > 0) {
                that.date = new Date(item.History[item.History.length - 1].EndDate).format("mmm dd, yyyy");
            }

            that.setCost(item.History);

            if (that.cost === 0) {
                that.billClass = "paid";
            }

            that.history = item.History;

            kendo.data.ObservableObject.fn.init.apply(that, that);
        },

        setCost: function (history) {
            var that = this;

            for (var i = 0, l = history.length; i < l; i++) {
                if (!history[i].Paid) {
                    that.cost += history[i].Cost;
                }
            }
        }
    });

    BillsViewModel = kendo.data.ObservableObject.extend({
        viewId: "#bills-view",
        billsDataSource: null,
        totalCost: 0,
        isEn: true,
        showPay: false,

        events: {
            payAll: "payAll"
        },

        init: function () {
            var that = this;

            that.billsDataSource = new kendo.data.DataSource({
                pageSize: 10
            });

            kendo.data.ObservableObject.fn.init.apply(that, that);
        },

        onPayAllClick: function () {
            var that = this;

            that.trigger(that.events.payAll, {
                billsToPay: that.get("billsDataSource").data()
            });
        }
    });


    BillsService = kendo.Class.extend({
        viewModel: null,

        expandExp: {
            "History": true,
            "Type": true,
        },

        init: function () {
            var that = this;

            that.viewModel = new BillsViewModel();
            that._bindToEvents();

            that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
        },

        _bindToEvents: function () {
            var that = this;

            that.viewModel.bind(that.viewModel.events.payAll, $.proxy(that.onPayAll, that));
        },

        _initModule: function () {

        },

        _showModule: function () {
            var that = this,
                language = app.settingsService.getLanguage();

            app.common.showLoading();

            that.viewModel.$view = $(that.viewModel.viewId);
            that.viewModel.$view.removeClass("en ar").addClass(language);
            that.viewModel.set("isEn", language === "en");

            that.getBillsData();
        },

        getBillsData: function () {
            var that = this;

            return app.everlive.data("Bill").expand(that.expandExp).get()
                .then($.proxy(that.storeBills, that));
        },

        storeBills: function (data) {
            var that = this,
                newBill,
                totalCost = 0,
                ds = [];

            for (var i = 0, l = data.result.length; i < l; i++) {
                newBill = new Bill(data.result[i]);

                if (newBill.cost !== 0) {
                    totalCost += newBill.cost;
                }


                ds.push(newBill);
            }

            if (totalCost !== 0) {
                that.viewModel.set("showPay", true);
            }

            that.viewModel.set("totalCost", totalCost);
            that.viewModel.get("billsDataSource").data(ds);
            app.common.hideLoading();
        },

        onPayAll: function (data) {
            var that = this;

            if(that.viewModel.get("isEn")) {
           		app.common.showLoading("Payment proceeding. This might take a couple of minutes");
            } else {
                app.common.showLoading("دفع الدعوى. وهذا قد يستغرق بضع دقائق");
            }

            app.paymentService.pay(data.billsToPay)
                .then($.proxy(that.paymentCompleted, that));
        },

        paymentCompleted: function (data) {
            var that = this,
                bills = that.viewModel.get("billsDataSource").data();

            if (data.state === "approved") {
                for (var i = 0, l = bills.length; i < l; i++) {
                    for (var j = 0, ll = bills[i].history.length; j < ll; j++) {
                        if (!bills[i].history[j].Paid) {
                            app.everlive.data("BillHistory").updateSingle({
                                Id: bills[i].history[j].Id,
                                "Paid": true
                            });
                        }
                    }
                }

                app.common.notification("Payment completed", "Payment Completed");
                that.getBillsData();
                app.common.hideLoading();
                this.viewModel.set("showPay", false);
            } else {
                app.common.notification("Payment failed", "Payment failed");
                app.common.hideLoading();
            }
        }
    });

    app.billsService = new BillsService();
})(window);