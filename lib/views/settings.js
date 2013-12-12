(function() {
    var Confirm = require("lib/views/confirm").Confirm,
        couchdbAuthUtil = require("lib/couchdbAuthUtil"),
        users = require("users");

    exports.Settings = Backbone.View.extend({
                el: '.page',
                render: function () {
                    this.submitterTemplate = $('#submitter-template').html();
                    this.settingsTemplate = $('#settings-template').html()
                    this.userObj = undefined;
                    this.full_name = false;
                    var that = this;

                    if (!storedCredentials) {
                        router.navigate('login', {trigger:true});
                    } else {
                        
                        users.get(storedCredentials.name, function(err, userObj, info){
                            if (!err) {
                                that.userObj = userObj;
                                var template = _.template(that.settingsTemplate, { userObj: userObj });
                                that.$el.html(template);

                                if (!!userObj.lrsignature && !!userObj.lrsignature.full_name) {
                                    that.full_name = userObj.lrsignature.full_name;
                                }
                                that.setPreview(that.full_name);
                                that.$el.find('input[name="submitter"]').val(that.full_name || "");
                                
                                that.updatePwdStatus(userObj);

                                var pwd_btn = that.$el.find('.save-password');
                                pwd_btn.button({disabled:true});


                            } else {
                                that.userObj = null;
                                router.navigate('#logout', {trigger:true});
                            }
                            
                        });
                        
                    }
                },
                events: {
                    'click .purgeAll': 'purgeAll',
                    'click .update-submitter': 'saveSubmitter',
                    'click .save-password': 'savePassword',
                    'click .regenOAuth': 'regenOAuth',
                    'click div.oauth-info': 'selectText',
                    'keyup input.submitter': 'previewSubmitter',
                    'keyup input.password.verify': 'checkPasswordMatch'
                },
                updatePwdStatus: function(userObj) {
                    var pwd_status = this.$el.find('div.passwordSet');
                    users.get(userObj.name, function(err, user, info) {
                        if (couchdbAuthUtil.doesUserHavePassword(user)) {
                            pwd_status.html($("<div>", {class:'success-icon'}));
                        } else {
                            pwd_status.html($("<div>", {class:'error-icon'}));
                        }
                    });
                },
                setPreview: function(vanityName) {
                    var preview = this.$el.find("div.submitter-display"),
                        contents = _.template(this.submitterTemplate, {username:this.userObj.name, vanityname:vanityName});

                    preview.html(contents);    
                    
                },
                selectText: function(event) {
                    event.preventDefault();
                    var target = $(event.currentTarget);
                    console.log(target.text());
                    target.selectText();
                },
                regenOAuth: function(event) {
                    event.preventDefault();
                    var that = this;
                    couchdbAuthUtil.revokeAndRegenOAuth(that.userObj, function(err, response){

                        if (!err) {
                            users.get(storedCredentials.name, function(err, newObj, info){
                                that.userObj = newObj;
                                for (var key in newObj.oauth.consumer_keys) {
                                    that.$el.find("#consumerKey").text(key);
                                    that.$el.find("#consumerSecret").text(newObj.oauth.consumer_keys[key]);
                                }
                                for (var token in newObj.oauth.tokens) {
                                    that.$el.find("#token").text(token);
                                    that.$el.find("#tokenSecret").text(newObj.oauth.tokens[token]);
                                }
                            });
                        } else {
                            alert("There was a problem regenerating your OAuth Secrets.");
                        }

                    });

                },
                previewSubmitter: function(event) {
                    event.preventDefault();
                    this.setPreview(event.currentTarget.value);
                },
                checkPasswordMatch: function(event) {
                    event.preventDefault();
                    var passwd1 = $('input[name="password1"]'),
                        passwd2 = $('input[name="password2"]'),
                        btn = $('.save-password'),
                        pwdok = $('.field-icon');

                    if (!couchdbAuthUtil.checkPasswordMatch(passwd1.val(), passwd2.val())) {
                        pwdok.html($("<div>", {class:'error-icon'}));

                        btn.button('disable');
                    } else {
                        pwdok.html($("<div>", {class:'success-icon'}));
                        btn.button('enable');
                    }
                },
                savePassword: function(event) {
                    event.preventDefault();
                    var passwd1 = $('input[name="password1"]'),
                        passwd2 = $('input[name="password2"]'),
                        btn = $('.save-password'),
                        pwdmsg = $('.fieldRow.pwdmsg'),
                        that = this;

                    couchdbAuthUtil.savePassword(passwd1.val(), passwd2.val(), function(error, response, obj) {
                        if (error) {
                            alert(error);
                        } else {
                            passwd1.val("");
                            passwd2.val("");
                            btn.button('disable');
                            
                            pwdmsg.text("Password updated.");
                            pwdmsg.removeClass('red');
                            pwdmsg.addClass('success');

                            that.updatePwdStatus(obj);
                        }
                    });
                },
                saveSubmitter: function(event) {
                    event.preventDefault();
                    var inputSubmitter = this.$el.find('input[name="submitter"]');
    
                    users.get(storedCredentials.name, function(err, userObj, info){
                        if (!err) {
                            userObj.lrsignature = userObj.lrsignature || { };
                            var vanityName = inputSubmitter.val();
                            if (!vanityName) {
                                userObj.lrsignature.full_name = "";
                            } else {
                                userObj.lrsignature.full_name = inputSubmitter.val().trim();
                            }
                            users.update(userObj.name, null, userObj, function(err, response){
                                if (!err) {
                                    alert("Updated Full Name.");
                                }
                                else {
                                    alert(err);
                                }
                            });
                        }
                    });
                        
                },
                purgeAll: function(event) {
                    event.preventDefault();
                    var confirm = new Confirm({ 
                        confirm_cb: function(conf_yes) {
                            if (conf_yes == "yes") {
                                var model;
                                while (model = Items.first()) {
                                  model.destroy();
                                }
                                Items.reset();

                                router.navigate('', {trigger: true});
                            }
                        }, 
                        msg: "<p>Are you sure you want to purge all published items from your browser?</p> <p>This does not remove anything already published on the node. You should export your data before doing this.</p>", 
                        title: "Confirm Purge"
                    });
                    confirm.render();

                }
            });

})();