(function (global) {
    var claim,
        claimsViewModel,
        claimsService,
        app = global.app = global.app || {};

    app.newLeafData = app.newLeafData || {};

    claim = kendo.data.ObservableObject.extend({
        ID: null,
        Title: "",
        Approved: false,
        icon: "",
        color: "",
        claimClass: "",

        init: function (item) {
            var that = this;

            that.ID = item.ID;

            //if (item.Type) {
            //    that.icon = item.Type.Icon;
            //    that.color = item.Type.Color;
            //}
            that.Title = item.Title;
            that.Approved = item.Approved;


            //that.setCost(item.History);

            //if (that.cost === 0) {
                //that.claimClass = "paid";
            //}

            //that.history = item.History;

            kendo.data.ObservableObject.fn.init.apply(that, that);
        },
    });

    claimsViewModel = kendo.data.ObservableObject.extend({
        viewId: "#claims-view",
        claimsDataSource: null,

        //events: {
        //    payAll: "payAll"
        //},

        init: function () {
            var that = this;

            that.claimsDataSource = new kendo.data.DataSource({
                pageSize: 10
            });

            kendo.data.ObservableObject.fn.init.apply(that, that);
        },

        //onPayAllClick: function () {
        //    var that = this;

        //    that.trigger(that.events.payAll, {
        //        billsToPay: that.get("billsDataSource").data()
        //    });
        //}
    });


    claimsService = kendo.Class.extend({
        viewModel: null,

        init: function () {
            var that = this;

            that.viewModel = new claimsViewModel();
            that._bindToEvents();

            that.initModule = $.proxy(that._initModule, that);
            that.showModule = $.proxy(that._showModule, that);
        },

        _bindToEvents: function () {
            //var that = this;

           //that.viewModel.bind(that.viewModel.events.payAll, $.proxy(that.onPayAll, that));
        },

        _initModule: function () {

        },

        _showModule: function () {
            var that = this;
            app.common.showLoading();
            that.viewModel.$view = $(that.viewModel.viewId);
            that.getclaimsData();
        },

        getclaimsData: function () {
            var that = this;

            app.sharepointService.getListItems("claims", $.proxy(that.storeclaims, that),$.proxy(that._onError, that, ""));
        },

        storeclaims: function (data) {
            var that = this,
                newclaim,
                ds = [];

            for (var i = 0; i < data.d.results.length; i++) {
                newclaim = new claim(data.d.results[i]);
                ds.push(newclaim);
            }

            that.viewModel.get("claimsDataSource").data(ds);
            app.common.hideLoading();
        },
         _onError: function (provider, e) {
            app.common.hideLoading();
            app.common.notification("Error loading claims list", JSON.stringify(e));
        }

        //onPayAll: function (data) {
        //    var that = this;

        //    if(that.viewModel.get("isEn")) {
        //   		app.common.showLoading("Payment proceeding. This might take a couple of minutes");
        //    } else {
        //        app.common.showLoading("دفع الدعوى. وهذا قد يستغرق بضع دقائق");
        //    }

        //    app.paymentService.pay(data.billsToPay)
        //        .then($.proxy(that.paymentCompleted, that));
        //},

        //paymentCompleted: function (data) {
        //    var that = this,
        //        bills = that.viewModel.get("billsDataSource").data();

        //    if (data.state === "approved") {
        //        for (var i = 0, l = bills.length; i < l; i++) {
        //            for (var j = 0, ll = bills[i].history.length; j < ll; j++) {
        //                if (!bills[i].history[j].Paid) {
        //                    app.everlive.data("BillHistory").updateSingle({
        //                        Id: bills[i].history[j].Id,
        //                        "Paid": true
        //                    });
        //                }
        //            }
        //        }

        //        app.common.notification("Payment completed", "Payment Completed");
        //        that.getBillsData();
        //        app.common.hideLoading();
        //        this.viewModel.set("showPay", false);
        //    } else {
        //        app.common.notification("Payment failed", "Payment failed");
        //        app.common.hideLoading();
        //    }
        //}
    });

    app.claimsService = new claimsService();
})(window);