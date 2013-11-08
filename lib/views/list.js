(function() {
	var importer = require("lib/importer"),
		Upload = require("lib/views/upload").Upload;

	var List = Backbone.View.extend({
				el: '.page',
				initialize: function () {
					Items.fetch();
					this.listenTo(Items, 'add', this.addOne);
				},
				render: function () {
					if (!storedCredentials) {
						router.navigate('login', {trigger:true});
					} else {
						var template = _.template($('#list-template').html(), {name:storedCredentials.name,data:Items.models});
						this.$el.html(template);
						Items.each(this.addOne, this);
						var count = new Count();
						count.render();
					}
				},
				events: {
					'click .selectall': 'selectall',
					'click .selectnone': 'selectnone',
					'submit .bulkactions': 'doInBulk',
					'click .showAll': 'showAll',
					'click .showPublished': 'showPublished',
					'click .showModified': 'showModified',
					'click .showUnpublished': 'showUnpublished',
					'click .showErrors': 'showErrors',
					'click .help': 'showHelp',
					'click #bulkUpload': 'showUpload',
					'click .export': 'exportData',
					'click .import': 'importData'
				},
				addOne: function (item) {
					var table = this.$("#item-list");
					if (table.length > 0) {
						var view = new ListItem({model: item});
						table.append(view.render().el);
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
					var form = $(event.target);
					var button = $(event.originalEvent.explicitOriginalTarget);
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

					var exportItems = _.map(filtered, function(item) {
						if ("ezjson" == format) {
							return item.toJSON();
						} else {
							return item.get("data");
						}
					});

					var eData = {
						"format": format,
						"description": (what == ""? "All" : what) + " Documents",
						"documents": exportItems,
					}


					console.log(exportItems);
					
					var contentType;

					if (/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())) {
						contentType = "application/octect-stream";
					} else {
						contentType = "application/json"
					}

					var b = new Blob([JSON.stringify(eData)], {type: contentType});

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
					// TODO
					event.preventDefault();
					var success = true;
					if (success && cb) {
						cb(event);
					}
				},
				delete: function (event) {
					event.preventDefault();
					var instance = this;
					this.unpublish(event, function (event) {
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