(function(){
	var Notification = require("lib/views/notification").Notification;
	
	var Upload = Backbone.View.extend({
				tagName: 'div',
				render: function () {
					var view = this;
					var template = _.template($('#upload-template').html(), {});
					this.$el.html(template);
					$('#dialogContainer').append(this.el);
					this.$el.dialog({
						autoOpen: true,
						title: $('#upload-template').attr('data-dialog-title'),
						width: 410,
						modal: true,
						position: {my:'top',at:'top',of:'.page'},
						close: function (event, ui) {
							$(this).dialog('destroy').remove();
							view.remove();
						}
					});
					this.$el.find("#csvHelp").button({
						icons: {
							primary: "ui-icon-help"
						},
						text: false
					});
					this.easyPub = new EasyPublish();
				},
				events: {
					'click #LoadCancel': 'cancel',
					'click #LoadData': 'load',
					'click #csvHelp': 'help'
				},
				cancel: function (event) {
					event.preventDefault();
					this.$el.dialog('close');
				},
				load: function(event) {
					event.preventDefault();
					var view = this;
					if (this.easyPub.importedData.numRows > 0) {
						var validation = this.easyPub.validateImportData();
						var importIndex = 0;
						// override getValue function to get data from import instead of form
						this.easyPub.getValue = function (id) {
							var field = view.easyPub.importedData[id];
							if (field) {
								return field[importIndex];
							} else {
								return '';
							}
						}
						// save each row
						for (importIndex=0; importIndex<this.easyPub.importedData.numRows; importIndex++) {
							this.easyPub.setCurrentImportData(importIndex);
                			var envelope = [this.easyPub.dataManager.makeEnvelope()];
                			if (validation.messages[importIndex].valid) {
                				var status = 'Unpublished';
                			} else {
                				var status = 'Error';
                			}
                			Items.create({data:envelope,status:status});
						}
						new Notification().render(this.easyPub.importedData.numRows, validation.totalErrorRows);
						this.$el.dialog('close');
					} else {
						alert('Please provide data to import.');
					}
				},
				help: function (event) {
					event.preventDefault();
					new Help().render();
				}
			});

	exports.Upload = Upload;
})();