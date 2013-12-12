(function() {
    
    var couchdbAuthUtil = require("lib/couchdbAuthUtil"),
        users = require("users");

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

})()