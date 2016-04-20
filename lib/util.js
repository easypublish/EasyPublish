
(function(){

	var commonAjax = function (method, url, options) {
        var settings = {
            type: method,
            contentType: "application/json",
            dataType: "json"
        }
        if (options) {
            settings = _.extend(settings, options);
        }
        var request = $.ajax(url, settings);

        return request;
    };

	exports.oauthRequest = function (path, message, accessor, undefined) {
        message.action = path;
        message.method = 'POST';
        //console.log(accessor);
        OAuth.completeRequest(message, accessor);
        var parameters = message.parameters;
        var options = {
            headers: {
                Authorization: OAuth.getAuthorizationHeader('', parameters)
            },
            data: JSON.stringify(message.body)
        }

        return commonAjax('POST', path, options);
    };


    exports.localStorageSize = function(callback) {
        setTimeout(function() {
            var numItems = localStorage.length,
                ls_size = 0;
            for (var i=0; i<numItems; i++) {
                ls_size += encodeURI(localStorage.getItem(localStorage.key(i))).split(/%..|./).length - 1;
            }
            if (!!callback)
                callback(ls_size)
            else
                console.log("checked local storage: "+ls_size+" Bytes Used");
        }, 0);
    };

    var one_ten24 = 1/1024;

    exports.localStorageSizeMB = function(callback) {
        exports.localStorageSize(function(bytes){
            callback(bytes*one_ten24*one_ten24);
        });
    };


})();
