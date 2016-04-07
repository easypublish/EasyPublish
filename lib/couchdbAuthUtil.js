(function(){

    var users = require("users"),
        session = require("session");

    // Simple secret key generator
    function generateSecret(length) {
        var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var secret = '';
        for (var i = 0; i < length; i++) {
            secret += tab.charAt(Math.floor(Math.random() * 64));
        }
        return secret;
    }

    function getOAuthInfo(userobj, cb) {
        var username = userobj.name;
        if (!(userobj.oauth && userobj.oauth.consumer_keys && userobj.oauth.consumer_keys[username] && userobj.oauth.tokens && userobj.oauth.tokens.node_sign_token)) {

            userobj.oauth = userobj.oauth || {};
            userobj.oauth.consumer_keys = userobj.oauth.consumer_keys || {};
            userobj.oauth.tokens = userobj.oauth.tokens || {};

            userobj.oauth.consumer_keys[username] = generateSecret(32);
            userobj.oauth.tokens.node_sign_token = generateSecret(32);

            if (!userobj.roles || _.indexOf(userobj.roles, "node_sign") == -1) {
                alert('node_sign role?')
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


    function revokeAndRegenOAuth(userObj, callback) {
        userObj.oauth.consumer_keys[userObj.name] = generateSecret(32);
        userObj.oauth.tokens.node_sign_token = generateSecret(32);

        users.update(userObj.name, null, userObj, function(err, response) {
            if (!err) {
                storedCredentials.oauth = userObj.oauth;
            }
            callback(err, response);
        });
    }

    function setOAuthInfo(authInfo) {
        storedCredentials.oauth = authInfo;
        if (storedCredentials.oauth) {
            storedCredentials.oauth.node_url = window.location.protocol+"//"+window.location.host;
        }
    }

    function checkPasswordMatch(passwd1, passwd2) {
        if (passwd1 === "" || passwd2 === "" || passwd1 !== passwd2)
            return false;
        return true;
    }

    function doesUserHavePassword(userObj) {
        if (userObj.password_scheme === "pbkdf2" &&
            !!userObj.derived_key &&
            userObj.derived_key.length > 0 ) {

            return true;

        } else if (userObj.password_scheme === "simple" &&
            !!userObj.password_sha &&
            userObj.password_sha.length > 0 &&
            !!userObj.salt &&
            userObj.salt.length > 0) {

            return true;

        } else {
            return false;
        }
    }


    function savePassword(passwd1, passwd2, callback) {
        if ( checkPasswordMatch(passwd1, passwd2) ) {

            users.get(storedCredentials.name, function(err, doc){
                doc.password = passwd1;

                users.update(doc.name, null, doc, function(err) {
                    if (err) {
                        if (callback)
                            callback("Unable to save publish password.", err);
                        else
                            console.log("Error saving password: ", err);
                    } else {

                        session.login(doc.name, passwd1, function(err, response){

                            if (callback)
                                callback(err,response,doc);
                            else
                                console.log("Saved publish password.");

                        });

                    }
                });
            });

        } else {
            callback("Passwords do no match.", null);
        }
    }

    exports.generateSecret = generateSecret;
    exports.getOAuthInfo = getOAuthInfo;
    exports.setOAuthInfo = setOAuthInfo;
    exports.checkPasswordMatch = checkPasswordMatch;
    exports.savePassword = savePassword;
    exports.doesUserHavePassword = doesUserHavePassword;
    exports.revokeAndRegenOAuth = revokeAndRegenOAuth;


})();