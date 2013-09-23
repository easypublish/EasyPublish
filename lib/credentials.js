(function() {
    var users = require("users");

    // Simple secret key generator
    var generateSecret = function(length) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var secret = '';
        for (var i = 0; i < length; i++) {
            secret += tab.charAt(Math.floor(Math.random() * 64));
        }
        return secret;
    }

    var getOAuthInfo = function(userobj, cb) {
        var username = userobj.name;
        if (!(userobj.oauth && userobj.oauth.consumer_keys && userobj.oauth.consumer_keys[username] && userobj.oauth.tokens && userobj.oauth.tokens.node_sign_token)) {

            userobj.oauth = userobj.oauth || {};
            userobj.oauth.consumer_keys = userobj.oauth.consumer_keys || {};
            userobj.oauth.tokens = userobj.oauth.tokens || {};

            userobj.oauth.consumer_keys[username] = generateSecret(32);
            userobj.oauth.tokens.node_sign_token = generateSecret(32);

            if (!userobj.roles || _.indexOf(userobj.roles, "node_sign") == -1) {
                userobj.roles = userobj.roles || [];
            }

            users.update(username, null, userobj, function(err, response) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(response);
                    users.get(username, function(err, userobj, info) {
                        if (err)
                            console.log(err);
                        else
                            getOAuthInfo(userobj, cb);
                    });
                    
                }
            });
        } else {
            cb({
                "consumerKey": username,
                "consumerSecret": userobj.oauth.consumer_keys[username],
                "token": "node_sign_token",
                "tokenSecret": userobj.oauth.tokens.node_sign_token
            });
        }
    }

    var setOAuthInfo = function(authInfo) {
        storedCredentials.oauth = authInfo;
        if (storedCredentials.oauth) {
            storedCredentials.oauth.node_url = window.location.protocol+"//"+window.location.host;
        }
    }


    // This will run when login is done.
    $.couch.browserid.login(function(event, error, user) {
        if (error)
            return console.log("Something went wrong with login: " + error);
        console.log(user);
        console.log("Congratulations " + user.name + ", you now have an account on my couch");
        users.get(user.name, function(err, userObj, info){
            if (err)
                console.log(err);
            else
                getOAuthInfo(userObj, setOAuthInfo);
        });
    });

    // This will run when logout is done.
    $.couch.browserid.logout(function(event, error) {
        if (error)
            return console.log("Something went wrong with logout: " + error);

        console.log("Sorry to see you go!");
        setOAuthInfo({
                "consumer_key": "",
                "consumer_secret": "",
                "token_key": "",
                "token_secret": ""
            });
    });

})()