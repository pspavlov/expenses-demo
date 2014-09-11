

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
                dataType: 'json',
            };
            if (data) {
                options.data = JSON.stringify(data);
            }
            
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
                error: error,
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
        decode: function(input, arrayBuffer) {
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            //get last chars to see if are valid
            var lkey1 = _keyStr.indexOf(input.charAt(input.length - 1));		 
            var lkey2 = _keyStr.indexOf(input.charAt(input.length - 2));		 
	
            var bytes = (input.length / 4) * 3;
            if (lkey1 == 64)
                bytes--; //padding chars, so skip
            if (lkey2 == 64)
                bytes--; //padding chars, so skip
		
            var uarray;
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;  
            var j = 0;
		 
            if (arrayBuffer)   
                uarray = new Uint8Array(arrayBuffer);
            else
                uarray = new Uint8Array(bytes);
		
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
		
            for (i=0; i < bytes; i+=3) {	
                //get the 3 octects in 4 ascii chars
                enc1 = _keyStr.indexOf(input.charAt(j++));
                enc2 = _keyStr.indexOf(input.charAt(j++));
                enc3 = _keyStr.indexOf(input.charAt(j++));
                enc4 = _keyStr.indexOf(input.charAt(j++));
	
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;  
	
                uarray[i] = chr1;	  		
                if (enc3 != 64) 
                    uarray[i + 1] = chr2;   
                if (enc4 != 64)
                    uarray[i + 2] = chr3;
            }
	
            return uarray;
        },
        decodeArrayBuffer: function(input) {
            var bytes = (input.length / 4) * 3;
            ab = new ArrayBuffer(bytes); 
            this.decode(input, ab);  
		 
            return ab;  
        },       
        
        copy: function (buffer) {
            var bytes = new Uint8Array(buffer);
            var output = new ArrayBuffer(buffer.byteLength);  
            var outputBytes = new Uint8Array(output);        
            for (var i = 0; i < bytes.length; i++)
                m
            outputBytes[i] = bytes[i];
            return output;            
            return output;      
        },
        
        attachPictureToListItem: function(listname, id , imageURI, success, error) {
            var that = this;
            window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
                fileEntry.file(function(file) { 
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        console.log(e.target.result.byteLength);
                        that._ajaxCall1("web/lists/getByTitle('" + listname + "')/items(" + id + ")/AttachmentFiles/add(FileName='p11.jpg')", "POST", e.target.result, null, success, error);
                    }

                    reader.readAsArrayBuffer(file);
                });
            }, function(e) {
                alert(JSON.stringify(e))
            });
        }
    }
    app.sharepointService = new SharepointService();
})(window);