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
        Status: 'Registered',
        Etag: "",
        Uri: "",
        Photo: "//:0",
        events: {
            approveClaim: "approveClaim", 
            capturePhoto: "capturePhoto"
        },
        
		init: function () {
			var that = this;
			kendo.data.ObservableObject.fn.init.apply(that, arguments);
        },
        
        onApproveClaimClick: function() { 
            var that = this;
            
            that.trigger(that.events.approveClaim, {});
        },
        onAddPhotoClick: function() {          
            var that = this;
            that.trigger(that.events.capturePhoto, {});  
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
            that.viewModel.bind(that.viewModel.events.approveClaim, $.proxy(that.onApproveClaim, that));
            that.viewModel.bind(that.viewModel.events.capturePhoto, $.proxy(that.onCapturePhoto, that));
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

            app.sharepointService.getListItemById("Claims",dataId,  $.proxy(that.setData, that),  $.proxy(that.onError, that));
            
            app.sharepointService.getAttachmentByListItemId ("Claims",dataId, $.proxy(that.setPhoto, that),  $.proxy(that.onError, that));
             
            that.viewModel.$view = $(that.viewModel.viewId);
        },

		setData: function (claimData) {
			var that = this,
                claimData = claimData.d;

            that.viewModel.set("Title", claimData.Title);
            that.viewModel.set("Description", claimData.Description);
            that.viewModel.set("Status", claimData.Status);
            that.viewModel.set("Location", claimData.Location);
            that.viewModel.set("Amount", claimData.Amount);
			
            that.viewModel.set("Etag", claimData.__metadata.etag);
            that.viewModel.set("Uri", claimData.__metadata.uri);
            //that.viewModel.set("parentClass",  "ds-icon ds-icon-" + claimData.Type.Icon);
            //that.viewModel.set("innerClass", "fa " + claimData.Type.Icon);
            //that.viewModel.set("color", claimData.Type.Color);
			app.common.hideLoading(); 
		},
        setPhoto : function(blob){
            var url = window.URL || window.webkitURL;
            var imgSrc = url.createObjectURL(blob);
           
            this.viewModel.set("Photo", imgSrc);
        },
        
        
        onApproveClaim: function() { 
            var that = this;
            app.common.showLoading("Approval proceeding. This might take a couple of minutes");
            
            var updateClaim = {
                "Approved": true,
                "__metadata": { 'type': 'SP.Data.ClaimsListItem' }
            }
            
            app.sharepointService.updateListItem ("Claims",  that.viewModel.get("Etag"),that.viewModel.get("ID"), updateClaim, $.proxy(that.claimApproved, that), that.onError)
        },
        
        onCapturePhoto: function() {
            var that = this;
            navigator.camera.getPicture(function(imageData){
                
                app.sharepointService.attachPictureToListItem ("Claims",that.viewModel.get("ID"), imageData,function(){
                    alert('success');
                },function(e){
                    console.log(JSON.stringify(e));
                });
                
            }, this._onCaptureFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URL}); 
        },
        _onCaptureFail: function(message){
            console.log(message);
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
			console.log(JSON.stringify(e));
            app.common.hideLoading();
			app.common.notification("Error", JSON.stringify(e));
		}
	});

	app.claimDetailsService = new claimDetailsService();
})(window);
