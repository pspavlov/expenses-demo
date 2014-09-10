(function (global) {
    var app = global.app = global.app || {};
    SharepointService = function() {
    };
    SharepointService.prototype = {
        init: function () {
           console.log('Testing all...');
            this._testAll();
        },
        
        _testAll: function() {
             var self = this;
            this.login('ppavlov', 'Telerik34', function(result) {
                var formDigestValue = result.d.GetContextWebInformation.FormDigestValue;
                console.log('1. Login:	' +  formDigestValue);     
                self.getListItems("claims", function(result){
                    console.log('2. Get all:	' + JSON.stringify(result));
                    self.getListItemById("claims",2 , function(result){
                    	console.log('3. Get by ID:	' + JSON.stringify(result));
                	}, function(err){
                    	console.log('get by Id epic fail' + JSON.stringify(err));
               	 });
                }, function(err){
                    console.log('get all epic fail' + JSON.stringify(err)); 
                });
            }, function(err) {
                console.log(JSON.stringify(err)); 
            });
        },
        
        _ajaxCall: function(path, method, data,headers, success, error) {
            
            if(!headers){
            	headers = {};    
            }
            headers["ACCEPT"] = "application/json;odata=verbose";
            headers["Authorization"] = "Basic " + app.settingsService.userAuthHash;
            headers["Content-Type"] = "application/json;odata=verbose";
            if(method ==="POST"){
                headers["X-RequestDigest"] = localStorage.getItem("formDigestValue");
            }
            var options = {
                       url: app.config.sharepoint.baseUrl + path,
                       type: method,
                       headers:headers,
                       success: success,
                       error: error,
                       dataType: 'json',
                   };
            if(data){
                options.data = JSON.stringify(data);
            }
            
            $.ajax(options);
        },
        
        login: function(username, password, success, error) {
            var bytes = Crypto.charenc.Binary.stringToBytes(username + ":" + password); 
            app.settingsService.userAuthHash = Crypto.util.bytesToBase64(bytes);
            this._ajaxCall("contextinfo","POST", null, null, success, error);
        },
        
        getListItems: function(listName, success, error) {
            this._ajaxCall("web/lists/getByTitle('" + listName + "')/items","GET", null, null, success, error);  
        },
        
        getListItemById: function(listname, id, success, error){
           this._ajaxCall("web/lists/getByTitle('" + listname +"')/items(" + id + ")", "GET", null, null,  success, error);
        },
        
        updateListItem: function(listname, etag, id, data, success, error){
            console.log('etag' + etag);
            var headers = {};
            headers["IF-MATCH"] = etag;
            headers["X-HTTP-Method"] = "MERGE"
            this._ajaxCall("web/lists/getByTitle('" + listname +"')/items(" + id + ")", "POST", data, headers, success, error);
        },
        
        createListItem: function(listname,data, success, error){

            this._ajaxCall("web/lists/getByTitle('" + listname + "')/items","POST",data, null, success, error); 
        },
    }
    app.sharepointService = new SharepointService();
})(window);


