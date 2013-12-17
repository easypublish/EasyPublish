(function(){
	var Standards = require("lib/views/standards").Standards;

	exports.Create = Backbone.View.extend({
				el: '.page',
				action: 'create',
				item: false,
				render: function () {
					if (!storedCredentials) {
						router.navigate('login', {trigger:true});
					} else {
						var view = this;
						var template = _.template($('#edit-template').html(), {action:this.action});
						this.$el.html(template);
						this.easyPub = new EasyPublish();
						this.easyPub.bind("fileDropped", function(){ 
							view.$el.find(".multi-choice").trigger("chosen:updated"); 
						});

						this.easyPub.buildForm("main", this.easyPub.fieldManager.mainFields);
						// this.easyPub.buildForm("alignment", this.easyPub.fieldManager.alignmentFields);
						this.easyPub.buildForm("author", this.easyPub.fieldManager.authorFields);
						this.easyPub.buildForm("publisher", this.easyPub.fieldManager.publisherFields);
						this.alignmentForm = new Standards({el: $("#alignmentForm")[0], fieldInfo:this.easyPub.fieldManager.alignmentFields});
						this.alignmentForm.render();

						if (this.item) {
							this.easyPub.setEditData(this.item.get('data')[0]);
						}

						// Dynamic buttons and menus in the Import Data box
						var dataSelect = this.$el.find('#dataSelect');
						dataSelect.selectmenu({
							style:'popup',
							width: 300,
						    change: function(e, object){
						        view.easyPub.setImportIndex(dataSelect.selectmenu("index"), false, true);
						        view.$el.find(".multi-choice").trigger("chosen:updated");
						    }
						});
						dataSelect.selectmenu('disable');
						this.$el.find('#removeRow').button({
							disabled: true
						});
						this.$el.find('#csvHelp').button({
							icons: {
								primary: 'ui-icon-help'
							},
							text: false
						});
						this.$el.find('#prevData').button({
							icons: {
								primary: 'ui-icon-arrowthick-1-w',
							},
							disabled: true 
						});
						this.$el.find('#nextData').button({
							icons: {
								secondary: 'ui-icon-arrowthick-1-e',
							},
							disabled: true 
						});

						// Author buttons
						this.$el.find("#addAuthor").button({
							icons: {
								secondary: "ui-icon-plus",
							}
						});
					

						// update the multi-choice UI.
						this.$el.find(".multi-choice").trigger("chosen:updated");
					}
				},
				events: {
					'click #Save': 'save',
					'click #Submit': 'publish',
					'click #csvHelp': 'help',
					'click #prevData': 'prevImportData',
					'click #nextData': 'nextImportData',
					'click #removeRow': 'removeImportRow',
					'click #addAuthor': 'addAuthor'
				},
				publish: function (event) {
					event.preventDefault();
					if(this.easyPub.validateAll()) {
						var view = this;
						var data = this.easyPub.dataManager.makeAllEnvelopes();
						// publish all items all together
						if (this.item) {
							var replacing = this.item.get('replacing'),
								newStatus = this.item.get('status');

							if (this.item.get('status') === 'Published') {
								newStatus = 'Modified';
								replacing = this.item.get('data');
							}
							this.item.save({data:data, status: newStatus, replacing:replacing});
						} else {
							this.item = Items.create({data:data, status:'Unpublished'});
						}
						this.item.publish(function () {
							// then create new items if there is more than one imported item
							var arr = view.item.get('data');
							if (arr.length > 1) {
								for (var i=1,l=arr.length; i<l; i++) {
									Items.create({data:[arr[i]], status:'Published'});
								}
								view.item.save({'data':[arr[0]]});
							}
							router.navigate('', {trigger:true});
						});
					} else {
						alert("Please correct the indicated problems");
					}
				},
				save: function (event) {
					event.preventDefault();
					if (window.File && window.FileReader && window.FileList && window.Blob) {
						if(this.easyPub.validateAll()) {
							var data = this.easyPub.dataManager.makeAllEnvelopes();
							if (this.item) {
								var replacing = this.item.get('replacing'),
									newStatus = this.item.get('status');

								if (this.item.get('status') === 'Published') {
									newStatus = 'Modified';
									replacing = this.item.get('data');
								}
								this.item.save({data:data, status: newStatus, replacing:replacing});
							} else {
								for (var i=0,l=data.length; i<l; i++) {
									Items.create({data:[data[i]], status:'Unpublished'});
								}
							}
							router.navigate('', {trigger:true});
						} else {
							alert("Please correct the indicated problems");
						}
					} else {
						alert('The File APIs are not fully supported in this browser. You will not be able to save locally before publishing.');
					}
				},
				help: function (event) {
					event.preventDefault();
					new Help().render();
				},
				prevImportData: function (event) {
					event.preventDefault();
					if (this.easyPub.importIndex > 0) {
						this.easyPub.setImportIndex(this.easyPub.importIndex - 1, true, true);
						this.$el.find(".multi-choice").trigger("chosen:updated");
					}
				},
				nextImportData: function (event) {
					event.preventDefault();
					if (this.easyPub.importIndex < (this.easyPub.importedData.numRows - 1)) {
						this.easyPub.setImportIndex(this.easyPub.importIndex + 1, true, true);
						this.$el.find(".multi-choice").trigger("chosen:updated");
					}
				},
				removeImportRow: function (event) {
					event.preventDefault();
					// this didn't seem to do anything in old EasyPub.js, either
				},
				addAuthor: function (event) {
					event.preventDefault();
					this.easyPub.addAuthor();
				}
			});
})();