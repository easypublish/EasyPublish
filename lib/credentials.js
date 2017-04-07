(function() {

    var couchdbAuthUtil = require("lib/couchdbAuthUtil"),
        users = require("users");
        app = require("lib/app");

    function checkSession(event){
        if (storedCredentials) {
            //log(storedCredentials);
            users.get(storedCredentials.name, function(err, userObj, info){
                if (err) {
                    router.navigate('#logout', {trigger:true});
                    if (typeof(w)!=="undefined") {
                        w.terminate();
                    }
                }
            });
        }
    }

    /* Checks if a current session exists by querying the Auth Server */
    function checkCurrentSession () {
        var currentSessionUrl = app.config.authServerBaseUrl + '/sessions/current';
        var w = undefined;

        $.getJSON(currentSessionUrl, function (data) {
            log('[Learning Registry Auth Server] Current User: ' + data.email);
            getUserInfo(data.email);
            $('.credentials').hide();

            storedCredentials = data;
            storedCredentials.name = data.email;

            //log("got session and storedCredentials is - ");
            //log(storedCredentials);

            $('#main-nav .signed-in').show();
            //console.log("Logged In!");
            //console.log(router.current());
            router.navigate('', {trigger:true});
            if (typeof(w)==="undefined") {
                w = new Worker("js/worker.js");
                w.onmessage = checkSession;
                w.postMessage({millis:180000});
            }

        }).fail(function () {
            log('[Learning Registry Auth Server] User has no active session');
        });
    };

    /* Enables credentials in order to send the cookie in AJAX requests */
    function configureAjaxOptions () {
        $(document).ajaxSend(function (event, xhr, settings) {
            settings.xhrFields = {
                withCredentials: true
            };
        });
    }

    /* Changes the href attribute of the provider login buttons and sets
    /* automatically the back url to the current page */
    function buildProviderLinks () {
        $(".credentials a").each(function () {
            var url = app.config.authServerBaseUrl + "/verify/" +
                $(this).data("provider") + "?back_url=" + window.location.href;
            $(this).attr("href", url);
        });
    }

    function getUserInfo(email) {
        users.get(email, function(err, doc) {
            if (!err) {
                getOAuth(email, doc);
            }
            else {
                //setMessage(err);
                alert('getUserInfo error: ' + err);
            }
        });
    }

    function log(msg) {
        try{
            console.log(msg)
        } catch (e) {

        }
    }

    function getOAuth(email, doc, regenerate) {
        if (regenerate || !(doc.oauth
            && doc.oauth.consumer_keys
            && doc.oauth.consumer_keys[email]
            && doc.oauth.tokens
            && doc.oauth.tokens.node_sign_token)) {

            //log("regenerating or didnt have enough oauth. doc.oauth before - ")
            //log(doc.oauth);

            doc.oauth = doc.oauth || {};
            doc.oauth.consumer_keys = doc.oauth.consumer_keys || {};
            doc.oauth.tokens = doc.oauth.tokens || {};

            doc.oauth.consumer_keys[email] = exports.generateSecret(32);
            doc.oauth.tokens.node_sign_token = exports.generateSecret(32);

            if (!doc.roles || _.indexOf(doc.roles, "node_sign") == -1) {
                doc.roles = doc.roles || [];
                // doc.roles.push("node_sign");
            }

            users.update(email, null, doc, function(err) {
                if (err) {
                    log('users.update error: ' + err);
                } else {
                    getUserInfo(email);
                }
            });

            //log("doc.oauth after users.update - ")
            //log(doc.oauth);

        } else {
            couchdbAuthUtil.setOAuthInfo({
                "consumer_key": email,
                "consumer_secret": doc.oauth.consumer_keys[email],
                "oauth_token": "node_sign_token",
                "token_secret": doc.oauth.tokens.node_sign_token
            });

            //$(".oauth").show(500);
            //$("#consumer_key").val(email)
            //$("#consumer_secret").val(doc.oauth.consumer_keys[email]);
            //$("#token_secret").val(doc.oauth.tokens.node_sign_token);
        }

    }


    exports.buildProviderLinks = buildProviderLinks;
    exports.configureAjaxOptions = configureAjaxOptions;
    exports.checkCurrentSession = checkCurrentSession;

/* old Persona code

    // This will run when login is done.
    $.couch.browserid.login(function(event, error, user) {
        if (error) {
            console.log("Something went wrong with login: " + error);
            return error;
        }
        // console.log(user);
        // console.log("Congratulations " + user.name + ", you now have an account on my couch");
        users.get(user.name, function(err, userObj, info){
            if (err)
                console.log(err);
            else
                couchdbAuthUtil.getOAuthInfo(userObj, couchdbAuthUtil.setOAuthInfo);
        });
    });

    // This will run when logout is done.
    $.couch.browserid.logout(function(event, error) {
        if (error) {
            console.log("Something went wrong with logout: " + error);
            return error;
        }

        // console.log("Sorry to see you go!");
        couchdbAuthUtil.setOAuthInfo({
                "consumer_key": "",
                "consumer_secret": "",
                "token_key": "",
                "token_secret": ""
            });
    });
*/

})()
