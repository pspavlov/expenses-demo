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
                self.getListItems("Expenses", function(result){
                    console.log('2. Get all:	' + JSON.stringify(result));
                    self.getListItemById("Expenses",2 , function(result){
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
        
        _ajaxCall: function(path, method, body, headers, success, error) {
            $.ajax({
                       url: app.config.sharepoint.baseUrl + path,
                       type: method,
                       headers: {"ACCEPT": "application/json;odata=verbose", "Authorization": "Basic " + app.settingsService.userAuthHash},
                       success: success,
                       error: error,
                       dataType: 'json',
                   });
        },
        
        login: function(username, password, success, error) {
            var bytes = Crypto.charenc.Binary.stringToBytes(username + ":" + password); 
            app.settingsService.userAuthHash = Crypto.util.bytesToBase64(bytes);
            this._ajaxCall("contextinfo","POST", null, null,success, error);
        },
        
        getListItems: function(listName, success, error) {
            this._ajaxCall("web/lists/getByTitle('" + listName + "')/items","GET", null, null, success, error);
        },
        
        getListItemById: function(listname, id, success, error){
           this._ajaxCall("web/lists/getByTitle('" + listname +"')/items(" + id + ")","GET",null, null, success, error);
        },
        
        updateListItem: function(listname, id, success, error){
            //todo : implement headers and body in the ajax call function
            var body = { '__metadata': { 'type': 'SP.Data.TestListItem' }, 'Title': 'TestUpdated'};
            this._ajaxCall("web/lists/getByTitle('" + listname +"')/items(" + id + ")","POST", body, headers, success, error);
            /*
            headers:
            Authorization: "Bearer " + accessToken
             X-RequestDigest: form digest value
            "IF-MATCH": etag or "*"
            "X-HTTP-Method":"MERGE",
            accept: "application/json;odata=verbose"
            content-type: "application/json;odata=verbose"
            content-length:length of post body
            */
        },
        
        createListItem: function(listname, id, success, error){
            console.log('create item not implemented');
            /*
            url: http://site url/_api/web/lists/GetByTitle(‘Test')/items
            method: POST
            body: { '__metadata': { 'type': 'SP.Data.TestListItem' }, 'Title': 'Test'}
            headers:
            Authorization: "Bearer " + accessToken
             X-RequestDigest: form digest value
            accept: "application/json;odata=verbose"
            content-type: "application/json;odata=verbose"
            content-length:length of post body
            */
        },
    }
    app.sharepointService = new SharepointService();
})(window);


