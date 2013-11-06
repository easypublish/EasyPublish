
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
    
})();
