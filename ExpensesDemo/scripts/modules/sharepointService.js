

(function (global) {
    var app = global.app = global.app || {};
    SharepointService = function() {
    };
    SharepointService.prototype = {
        init: function () {
            //console.log('Testing all...');
            //this._testAll();
        },
        
        _testAll: function() {
            var self = this;
            this.login('ppavlov', 'Telerik34', function(result) {
                var formDigestValue = result.d.GetContextWebInformation.FormDigestValue;
                console.log('1. Login:	' + formDigestValue);     
                self.getListItems("claims", function(result) {
                    console.log('2. Get all:	' + JSON.stringify(result));
                    self.getListItemById("claims", 2 , function(result) {
                        console.log('3. Get by ID:	' + JSON.stringify(result));
                    }, function(err) {
                        console.log('get by Id epic fail' + JSON.stringify(err));
                    });
                }, function(err) {
                    console.log('get all epic fail' + JSON.stringify(err)); 
                });
            }, function(err) {
                console.log(JSON.stringify(err)); 
            });
        },
        
        _ajaxCall: function(path, method, data, headers, success, error) {
            if (!headers) {
                headers = {};    
            }
            headers["ACCEPT"] = "application/json;odata=verbose";
            headers["Authorization"] = "Basic " + app.settingsService.userAuthHash;
            headers["Content-Type"] = "application/json;odata=verbose";
            if (method ==="POST") {
                headers["X-RequestDigest"] = localStorage.getItem("formDigestValue");
            }
            var options = {
                url: app.config.sharepoint.baseUrl + path,
                type: method,
                headers:headers,
                success: success,
                error: error,
                dataType: 'json'
            };
            if (data) {
                options.data = JSON.stringify(data);
            }
            
            $.ajax(options);
        },
        _ajaxCallImage: function(path, success, error) {

            headers = {};    
            headers["Authorization"] = "Basic " + app.settingsService.userAuthHash;
            var options = {
                url: app.config.sharepoint.baseUrl + path,
                type: 'GET',
                headers:headers,
                processData : false,
                success: success,
                error: error,
            };
            $.ajax(options);
        },
        _ajaxCall1: function(path, method, data, headers, success, error) {
            if (!headers) {
                headers = {};    
            }
            headers["ACCEPT"] = "application/json;odata=verbose";
            headers["Authorization"] = "Basic " + app.settingsService.userAuthHash;
            headers["Content-Length"] = data.byteLength;
            if (method ==="POST") {
                headers["X-RequestDigest"] = localStorage.getItem("formDigestValue");
            }
            var options = {
                url: app.config.sharepoint.baseUrl + path,    
                type: method,
                headers:headers,
                success: success,
                processData: false,
                error: error
            };
            if (data) {
                options.data = data;
            }
            
            $.ajax(options);
        },
        
        login: function(username, password, success, error) {
            var bytes = Crypto.charenc.Binary.stringToBytes(username + ":" + password); 
            app.settingsService.userAuthHash = Crypto.util.bytesToBase64(bytes);
            this._ajaxCall("contextinfo", "POST", null, null, success, error);
        },
        
        getListItems: function(listName, success, error) {
            this._ajaxCall("web/lists/getByTitle('" + listName + "')/items", "GET", null, null, success, error);  
        },
        
        getListItemById: function(listname, id, success, error) {
            this._ajaxCall("web/lists/getByTitle('" + listname + "')/items(" + id + ")", "GET", null, null, success, error);
        },
        
        updateListItem: function(listname, etag, id, data, success, error) {
            var headers = {};
            headers["IF-MATCH"] = etag;
            headers["X-HTTP-Method"] = "MERGE"
            this._ajaxCall("web/lists/getByTitle('" + listname + "')/items(" + id + ")", "POST", data, headers, success, error);
        },
          
        createListItem: function(listname, data, success, error) {
            this._ajaxCall("web/lists/getByTitle('" + listname + "')/items", "POST", data, null, success, error); 
        },
        
        copy: function (buffer) {
            var bytes = new Uint8Array(buffer);
            var output = new ArrayBuffer(buffer.byteLength);  
            var outputBytes = new Uint8Array(output);        
            for (var i = 0; i < bytes.length; i++)
                m
            outputBytes[i] = bytes[i];

            return output;            
        },
        
        attachPictureToListItem: function(listname, id , imageURI, success, error) {
            var that = this;
            window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                fileEntry.file(function(file) { 
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        console.log(e.target.result.byteLength);
                        that._ajaxCall1("web/lists/getByTitle('" + listname + "')/items(" + id + ")/AttachmentFiles/add(FileName='photo.jpg')", "POST", e.target.result, null, success, error);
                    }

                    reader.readAsArrayBuffer(file);
                });
            }, function(e) {
                console.log(JSON.stringify(e))
            });
        },
        
        getAttachmentByListItemId: function(listname, id, success, error) {
            //TODO make this work with PNG images as well.
            var url = app.config.sharepoint.baseUrl +  "web/lists/getByTitle('" + listname + "')/items(" + id + ")/AttachmentFiles('photo.jpg')/$value";
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = function(){
                if (this.readyState == 4 && this.status == 200){
                    var blob = new Blob([this.response], {type: 'image/jpg'})
                    success(blob);
                }
            }
            xhr.open('GET', url);
            xhr.setRequestHeader("Authorization","Basic " + app.settingsService.userAuthHash);
            xhr.responseType = 'blob';
            xhr.send(); 
            
            //It seems impossible to do that with the following ajax call !?!?
            //this._ajaxCallImage("web/lists/getByTitle('" + listname + "')/items(" + id + ")/AttachmentFiles('photo.jpg')/$value", success, error);
        },
    }
    app.sharepointService = new SharepointService();
})(window);