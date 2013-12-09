(function() {
    var Confirm = require("lib/views/confirm").Confirm,
        users = require("users");


    exports.Settings = Backbone.View.extend({
                el: '.page',
                render: function () {
                    this.submitterTemplate = $('#submitter-template').html();
                    this.userObj = undefined;
                    this.full_name = false;
                    var that = this;

                    if (!storedCredentials) {
                        router.navigate('login', {trigger:true});
                    } else {
                        
                        users.get(storedCredentials.name, function(err, userObj, info){
                            if (!err) {
                                that.userObj = userObj;
                                var template = _.template($('#settings-template').html(), { userObj: userObj });
                                that.$el.html(template);

                                if (!!userObj.lrsignature && !!userObj.lrsignature.full_name) {
                                    that.full_name = userObj.lrsignature.full_name;
                                }
                                that.setPreview(that.full_name);
                                that.$el.find('input[name="submitter"]').val(that.full_name || "");
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
                    'keyup input.submitter': 'previewSubmitter'
                },
                setPreview: function(vanityName) {
                    var preview = this.$el.find("div.submitter-display"),
                        contents = _.template(this.submitterTemplate, {username:this.userObj.name, vanityname:vanityName});

                    preview.html(contents);    
                    
                },
                previewSubmitter: function(event) {
                    event.preventDefault();
                    this.setPreview(event.currentTarget.value);
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