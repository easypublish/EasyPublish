(function(){
		
		var Preference = Backbone.Model.extend({
			defaults: {
				name: null,
				value: undefined
			},
			escapedValue: function(){
				var stored = this.get('value'),
					re = /\\([nrt])/ig,
					map = {
						'n': '\n',
						'r': '\r',
						't': '\t'
					},
					escapedChar, realChar;

				while ((escapedChar = re.exec(stored)) !== null) {
					if ((realChar = map[escapedChar[1]]) != undefined) {
						stored = stored.replace(escapedChar[0], realChar);
					}
				}
				return stored;

			}
		});


		var PreferenceList = Backbone.Collection.extend({
			model: Preference,
			localStorage: new Backbone.LocalStorage("EZPublishPrefs"),
			getPreference: function(key, default_value) {
				return this.get(key) || Preferences.create({id:key, value:default_value});
			}
		});

		var Item = Backbone.Model.extend({
			defaults: {
				data:'',
				status:'Unpublished',	// Allowed values are Published, Modified, Unpublished, and Error
				replacing:false
			},
			publish: function (cb) {
				if (this.get('status') != 'Error') {
			        var envelopes = this.get('data'),
			        	replacing = this.get('replacing');
			        this._sendPublishRequest(envelopes, replacing, 'publish', cb);
			    } else {
			    	alert("You cannot publish items with errors.");
			    }
		    },
		    unpublish: function (cb) {
				var instance = this;
				var status = this.get('status');

				if (status == 'Published' || status == 'Modified') {
			        var envelopes = this.get('data'),
			        	replacing = (status == 'Modified') ? this.get('replacing') : [];

			        // remove data from the envelopes
			        for (var i=0,l=envelopes.length; i<l; i++) {
			        	if (status == 'Published') {
			        		replacing.push({doc_ID:envelopes[i].doc_ID});
			        	}
			        	delete envelopes[i]._id;
			        	delete envelopes[i].doc_ID;
			        	delete envelopes[i].resource_locator;
			        	delete envelopes[i].payload_schema;
			        	delete envelopes[i].resource_data;
			        	delete envelopes[i]._rev;
			        	delete envelopes[i].digital_signature;
			        	delete envelopes[i].node_timestamp;
			        	delete envelopes[i].create_timestamp;
			        	delete envelopes[i].update_timestamp;
			        	delete envelopes[i].update_timestamp;
			        	envelopes[i].payload_placement = 'none';
			        	envelopes[i].identity = { 'submitter_type': 'agent'};
			        }

			        this._sendPublishRequest(envelopes, replacing, 'delete', cb);
			    } else {
			    	// Do nothing?
			    }
		    },
		    _sendPublishRequest: function (envelopes, replacing, action, cb) {
				var instance = this,
		    	    oauth_data = storedCredentials.oauth;

		    	if(oauth_data==null) {
		            console.log("null oauth_data, aborting submit")
		            return;
		        } else {
			    	if (replacing) {
		        		var replacement_ids = _.map(replacing, function(repl_doc){
	        				return repl_doc.doc_ID;
	        			});console.log(replacement_ids);

		        		for (var envIdx=0; envIdx<envelopes.length; envIdx++){
		        			var replaces_prop = envelopes[envIdx].replaces || [];

			        			envelopes[envIdx].replaces = _.without(_.union(replaces_prop, replacement_ids), null, undefined);
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
		                	if (action == 'publish') {
			                	instance.save('status','Published');
			                	for (var envIdx=0; envIdx<envelopes.length; envIdx++) {
			                		if (msg.document_results[envIdx].OK) {
			                			envelopes[envIdx].doc_ID = msg.document_results[envIdx].doc_ID
			                		}
			                	}
			                	instance.save('data',envelopes);
			                }

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
			}
		});
		var ItemList = Backbone.Collection.extend({
			model: Item,
			localStorage: new Backbone.LocalStorage("EZPublishItems")
		});
		

		exports = _.extend(exports, {
			Item: Item,
			ItemList: ItemList,
			Preference: Preference,
			PreferenceList: PreferenceList
		});

})();
