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

		    _prepareEnvelopes: function(envelopes)
		    {
		    	// Apply transformations on envelopes depending on envelope version

		    	return _.map(envelopes, function(envelope) {
		    		var e = _.extend({}, envelope);

		    		if(e.doc_version === '0.51.0')
		    		{
		    			// convert resource_data to string
		    			if(!_.isString(e.resource_data))
				        {
				            e.resource_data = JSON.stringify(e.resource_data);
				        }
		    		}

		    		return e;
		    	});
		    },

		    _sendPublishRequest: function (envelopes, replacing, action, cb) {
				var instance = this,
		    	    oauth_data = storedCredentials.oauth;

		    	envelopes = this._prepareEnvelopes(envelopes);

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

			    	var requestMessage = {
		                parameters: {},
		                body: {
		                    documents: envelopes
		                }
		            };
		            request = utils.oauthRequest(oauth_data.node_url + '/publish', requestMessage, oauth_data);

		            request.done(function(result) {
		                console.log(["Publish", requestMessage, result]);
		                var envelopes = instance.get('data');
		                if(result.OK
		                	&& result.document_results.length == envelopes.length) {
		                	if (action == 'publish') {
			                	instance.save('status','Published');
			                	for (var envIdx=0; envIdx<envelopes.length; envIdx++) {
			                		if (result.document_results[envIdx].OK) {
			                			envelopes[envIdx].doc_ID = result.document_results[envIdx].doc_ID
			                		}
			                	}
			                	instance.save('data',envelopes);
			                }

		                    if (cb) {
		                        cb(result.document_results);
		                    }
		                } else {
		                    alert("Submission failed:\n" + JSON.stringify(result.document_results));
		                }
		            });

		            request.fail(function(result) {
		                console.log(["Publish Fail", result]);
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
