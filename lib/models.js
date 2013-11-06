(function(){

		var Item = Backbone.Model.extend({
			defaults: {
				data:'',
				status:'Unpublished',	// Allowed values are Published, Modified, Unpublished, and Error
				replacing:false
			},
			publish: function (cb) {
				var instance = this;

				if (this.get('status') != 'Error') {
			        var envelopes = this.get('data'),
			        	replacing = this.get('replacing'),
			        	oauth_data = storedCredentials.oauth;


			        if(oauth_data==null) {
			            console.log("null oauth_data, aborting submit")
			            return;
			        } else {
			        	if (replacing) {
			        		var replacement_ids = _.map(replacing, function(repl_doc){
		        				return repl_doc.doc_ID;
		        			});

			        		for (var envIdx=0; envIdx<envelopes.length; envIdx++){
			        			var replaces_prop = envelopes[envIdx].replaces || [];

			        			envelopes[envIdx].replaces = _.union(replaces_prop, replacement_ids);
			        		}
			        	}

			            var message = {
			                parameters: {},
			                body: {
			                    documents: envelopes
			                }
			            };
			            request = utils.oauthRequest(oauth_data.node_url + '/publish', message, oauth_data);
			            
			            request.done(function(msg) {
			                console.log("Done");
			                console.log(msg);
			                var envelopes = instance.get('data');
			                if(msg.OK 
			                	&& msg.document_results.length == envelopes.length) {
			                	instance.save('status','Published');
			                	for (var envIdx=0; envIdx<envelopes.length; envIdx++) {
			                		if (msg.document_results[envIdx].OK) {
			                			envelopes[envIdx].doc_ID = msg.document_results[envIdx].doc_ID
			                		}
			                	}
			                	instance.save('data',envelopes);

			                    if (cb) {
			                        cb(msg.document_results);
			                    }
			                } else {
			                    alert("Submission failed:\n" + JSON.stringify(msg.document_results));
			                }
			            });

			            request.fail(function(msg) {
			                console.log("Fail");
			                console.log(msg);
			                alert("Submission failed.");
			            });
			        }
			    } else {
			    	alert("You cannot publish items with errors.");
			    }
		    }
		});
		var ItemList = Backbone.Collection.extend({
			model: Item,
			localStorage: new Backbone.LocalStorage("EZPublishItems")
		});
		

		exports = _.extend(exports, {
			Item: Item,
			ItemList: ItemList
		});

})();