(function() {
	var importer = require("lib/importer"),
		Upload = require("lib/views/upload").Upload,
		Help = require("lib/views/help").Help,
		util = require("lib/util");

	var List = Backbone.View.extend({
				el: '.page',
				initialize: function () {
					Items.fetch();
					this.listenTo(Items, 'add', this.addOne);
				},
				render: function () {
					var that = this;
					if (!storedCredentials) {
						router.navigate('login', {trigger:true});
					} else {
						var template = _.template($('#list-template').html(), {name:storedCredentials.name,data:Items.models});
						this.$el.html(template);
						Items.each(this.addOne, this);
						var count = new Count();
						count.render();
						util.localStorageSize(function(ls_bytes){
							var $ls = that.$el.find(".localStorageUsage"),
								ls_kb = new Number(ls_bytes * (1/1024)).toFixed(2);
							$ls.html($("<a>", { href: "#settings", text: "Local Storage: "+ ls_kb + " KB Used"}));

						});
					}
				},
				events: {
					'click .selectall': 'selectall',
					'click .selectnone': 'selectnone',
					'click .bulkactionsbtn': 'doInBulk',
					'click .showAll': 'showAll',
					'click .showPublished': 'showPublished',
					'click .showModified': 'showModified',
					'click .showUnpublished': 'showUnpublished',
					'click .showErrors': 'showErrors',
					'click .help': 'showHelp',
					'click #bulkUpload': 'showUpload',
					'click #sync': 'sync',
					'click .export': 'exportData',
					'click .import': 'importData'
				},
				addOne: function (item) {
					var table = this.$("#item-list");
					if (table.length > 0) {
						var view = new ListItem({model: item});
						var $el = view.render().$el
						table.append($el);

						// removing... incredibly slow plugin
						//$el.find('.description').ellipsis({ rows: 3 });
					} else {
						this.render();
					}
				},
				selectall: function (event) {
					event.preventDefault();
					var button = $(event.target);
					var fieldname = button.attr('data-checkboxes');
					button.closest('form').find('[name="' + fieldname + '"]').prop('checked', true);
				},
				selectnone: function (event) {
					event.preventDefault();
					var button = $(event.target);
					var fieldname = button.attr('data-checkboxes');
					button.closest('form').find('[name="' + fieldname + '"]').prop('checked', false);
				},
				doInBulk: function (event) {
					event.preventDefault();
					var form = $("form.bulkactions");
					var button = $(event.currentTarget);
					var selected = form.find('[name="items"]:checked');
					if (button) {
						var action =button.parents("div.control-row").find('[name="bulkmenu"]').val();
					} else {
						var action = form.find('[name="bulkmenu"]').val();
					}
					selected.each(function (index, el) {
						$(el).closest('tr').find('.' + action).trigger('click');
					});
					window.scrollTo(0,0);
				},
				showAll: function (event) {
					event.preventDefault();
					this.$("#item-list").empty();
					this.$(".filterButtons button").removeClass('selected');
					$(event.target).addClass('selected');
					Items.each(this.addOne, this);
				},
				showPublished: function (event) {
					event.preventDefault();
					this.$("#item-list").empty();
					this.$(".filterButtons button").removeClass('selected');
					$(event.target).addClass('selected');
					var filtered = Items.where({status:'Published'});
					for (var i=0,l=filtered.length; i<l; i++) {
						this.addOne(filtered[i]);
					}
					var filtered = Items.where({status:'Modified'});
					for (var i=0,l=filtered.length; i<l; i++) {
						this.addOne(filtered[i]);
					}
				},
				showModified: function (event) {
					event.preventDefault();
					this.$("#item-list").empty();
					this.$(".filterButtons button").removeClass('selected');
					$(event.target).addClass('selected');
					var filtered = Items.where({status:'Modified'});
					for (var i=0,l=filtered.length; i<l; i++) {
						this.addOne(filtered[i]);
					}
				},
				showUnpublished: function (event) {
					event.preventDefault();
					this.$("#item-list").empty();
					this.$(".filterButtons button").removeClass('selected');
					$(event.target).addClass('selected');
					var filtered = Items.where({status:'Unpublished'});
					for (var i=0,l=filtered.length; i<l; i++) {
						this.addOne(filtered[i]);
					}
				},
				showErrors: function (event) {
					event.preventDefault();
					this.$("#item-list").empty();
					this.$(".filterButtons button").removeClass('selected');
					$(event.target).addClass('selected');
					var filtered = Items.where({status:'Error'});
					for (var i=0,l=filtered.length; i<l; i++) {
						this.addOne(filtered[i]);
					}
				},
				showHelp: function (event) {
					event.preventDefault();
					var help = new Help();
					help.render();
				},
				showUpload: function (event) {
					event.preventDefault();
					var upload = new Upload();
					upload.render();
				},
				sync: function (event) {
					event.preventDefault();
					$.ajax('/services',{
						type: 'GET',
						dataType: 'json',
						success: function (data, textStatus, xhr) {
							if (data != undefined && data.node_id != undefined) {
								$.ajax('/extract/ezpublish-submitters/resource-by-discriminator',{
									data: 'discriminator=[%22' + data.node_id + '%22,%22' + storedCredentials.name + '%22]',
									type: 'GET',
									dataType: 'json',
									success: function (data, textStatus, xhr) {
										for (var i=0,dl=data.documents.length; i<dl; i++) {
											var doc = data.documents[i];
											for (var j=0,rl=doc.resource_data.length; j<rl; j++) {
												var resource = doc.resource_data[j];
												// console.log(resource.doc_ID);
												var newResource = true;
												var item;
												for (var k=0,il=Items.models.length; k<il; k++) {
													item = Items.models[k];
													if (resource.doc_ID == item.get('data')[0].doc_ID) {
														newResource = false;
														break;
													}
												}
												if (newResource) {
													// console.log('adding new resource');
													item = Items.create({data:[resource], status:'Published'});
													item.save();
												} else {
													// console.log('updating existing resource');
													item.set('data',[resource]);
													item.save();
												}
											}
										}
									},
									error: function (xhr, textStatus, errorThrown) { alert('Unable to get data from registry.'); }
								});
							} else {
								alert('Unable to get node id.');
							}
						},
						error: function (xhr, textStatus,  errorThrown) {
							alert('Unable to get node id.')
						}
					});
				},
				exportData: function(event) {
					event.preventDefault();
					var button = $(event.target);
					var form = button.parents('form');
					var what = button.attr('data-export');

					var format = form.find('[name="formatmenu"]').val();

					var filtered = Items.filter(function(record){
						if (what == "")
							return true;
						return what == record.get("status");
					});


					var contentType;
					var eData = {};

					if ("ezcsv" == format) {
						var csvColumns = {},
							cell_export_delim = Preferences.getPreference("export-csv-cell-delim", ",\\n").escapedValue(),
							row_delim = Preferences.getPreference("csv-row-delim", "\\n").escapedValue(),
							col_delim = Preferences.getPreference("csv-col-delim", ",").escapedValue(),
							quote_char = Preferences.getPreference("csv-quote-char", "\"").escapedValue();

						_.each(filtered, function(rawitem, index){

							var lrmidata = rawitem.get("data")[0];
							this.ezpub.setEditData(lrmidata);
							var engdata = this.ezpub.getData(true);

							for (var key in engdata) {
								csvColumns[key] = csvColumns[key] || [];
								if (csvColumns[key].length < index) {
									for (var fillIdx=csvColumns[key].length; fillIdx<index; fillIdx++) {
										csvColumns[key][fillIdx] = null;
									}
								}
								csvColumns[key][index] = engdata[key] || "";
							}

						}, {ezpub: new EasyPublish()});

						function quoted (value) {
							if (value == null) {
								return "";
							}
							else if (_.isArray(value)) {
								value = value.join(cell_export_delim);
							}
							return quote_char+value+quote_char;
						}

						var colHeads = _.keys(csvColumns);
						eData = _.map(colHeads, quoted).join(col_delim) + row_delim;
						for (var rowidx=0; rowidx<filtered.length; rowidx++) {
							_.each(colHeads, function (header, colidx, headItems) {
								eData += quoted(csvColumns[header][rowidx]||null);
								if (colidx == headItems.length-1)
									eData += row_delim;
								else
									eData += col_delim;
							})
						}

						contentType = "text/csv";

					} else {


						var exportItems = _.map(filtered, function(item) {
							if ("ezjson" == format) {
								return item.toJSON();
							} else {
								return item.get("data");
							}
						});

						eData = {
							"format": format,
							"description": (what == ""? "All" : what) + " Documents",
							"documents": exportItems,
						}
						console.log(exportItems);

						eData = JSON.stringify(eData);
						contentType = "application/json";

					}

					if (/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())) {
						contentType = "application/octet-stream";
					}

					var b = new Blob([eData], {type: contentType});

					var url = window.URL.createObjectURL(b);
					window.open(url, "blobwin");


				},
				importData: function(event) {
					event.preventDefault();
					var importView = new importer.Importer();
					importView.render();
				}
			});

	exports.List = List;

	var list = new List();

	exports.list = list;

	var ListItem = Backbone.View.extend({
				tagName: 'tr',
				initialize: function () {
					this.listenTo(this.model, 'change', this.render);
					this.listenTo(this.model, 'destroy', this.remove);
					this.listenTo(list, 'render', this.destroy);
				},
				render: function () {
					var template = _.template($('#item-template').html(), {item:this.model});
					this.$el.html(template);
					return this;
				},
				events: {
					'click .publish': 'publish',
					'click .unpublish': 'unpublish',
					'click .delete': 'delete',
					'click .edit': 'edit'

				},
				publish: function (event) {
					event.preventDefault();
					this.model.publish(function () {
					});
				},
				unpublish: function (event, cb) {
					event.preventDefault();
					var button = $(event.target);
					var delete_published = button.attr('data-delpub')==="true";
					if (delete_published) {
						this.model.unpublish(function () {
							cb();
						});
					} else {
						cb();
					}
				},
				delete: function (event) {
					event.preventDefault();
					var instance = this;
					this.unpublish(event, function () {
						instance.model.destroy();
					});
				},
				edit: function(event) {
					event.preventDefault();
					var button = $(event.target);
					router.navigate('edit/'+button.attr('data-item'), {trigger:true});
				}

			});

	exports.ListItem = ListItem;

	var Count = Backbone.View.extend({
		el: '#count',
		initialize: function () {
			this.listenTo(Items, 'add', this.render);
			this.listenTo(Items, 'destroy', this.render);
			this.listenTo(list, 'render', this.destroy);
		},
		render: function () {
			var template = _.template($('#count-template').html(), {total:Items.length});
			this.$el.html(template);
		}
	});
	exports.Count = Count;

})();
