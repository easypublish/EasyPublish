function TreeMenu(id, type) {
	this.id = id;
	this.type = type;
	var that = this;

	var currentSelectionData = "";
	var currentSelectionText = "";

	this.container = $('<div>', {
		id: this.id,
		name: this.id,
		title : this.tip
	});

	this.input = $('<input>', {
		id : "selection" + this.id,
		type: "text",
		class: "text ui-widget-content ui-corner-all"
	});
	this.input.attr("size", "44");
	this.input.appendTo(this.container);

	this.button = $('<button>', {
		id : "selectButton" + this.id
	});
	this.button.appendTo(this.container);

	this.menu = $('<ul>', {
		id : "selectMenu" + this.id
	});
	this.menu.appendTo(this.container);

	this.getCurrentSelectionData = function() {
		return currentSelectionData;
	}
	this.getCurrentSelectionText = function() {
		return currentSelectionText;
	}

	var selected = function( event, ui ) {
		var selectedText;
		var value = ui.item.children(":first").attr("value");
		if(value) {
			currentSelectionData = value;
			if(this.type="CCSS") {
				selectedText = ui.item.children(":first").attr("dotNotation");
				//var index = selectedText.lastIndexOf("CCSS");
				//selectedText = selectedText.slice(index);

			} else {
				selectedText = ui.item.text();
				var selectedTextArray=selectedText.split("\n");
				for(key in selectedTextArray) {
					var next = selectedTextArray[key];
					next = next.trim();
					if(next.trim().length>0) {
						selectedText = next;
						break;
					}
				}
			}
		} else {
			selectedText = "";
			currentSelectionData = null;
		}
		currentSelectionText = selectedText;
		$("#selection" + that.id).val(selectedText);
		$("#selectMenu" + that.id).hide();
	}

	this.getContainer = function() {
		return this.container;
	}

	this.getInput = function() {
		return this.input;
	}

	this.extendMenu = function(list, children) {
		for(key in children) {
			var child = children[key];
			var item = $('<li>');
			var linkObj = {
				text : child.name
			};
			var link = $('<a>', linkObj);
			if(child.value) {
				link.attr("value", child.value);
			}
			link.appendTo(item);
			if(child.children && child.children.length>0) {
				var sublist = $('<ul>');
				this.extendMenu(sublist, child.children);
				sublist.appendTo(item);
			}
			item.appendTo(list);
		}
		return list;
	}

	this.setChoices = function(choiceTree) {
		var children = choiceTree.children;
		this.extendMenu(this.menu, children);
	}

	this.setCCSSChoices = function(choices) {
		var ccss = new CCSS();
		ccss.buildStandardsListElement(this.menu, choices);
	}

	this.initGUI = function() {
		$("#selectMenu" + this.id).menu( {select: selected, trigger: $("#selectButton" + that.id)} );
		$("#selectMenu" + this.id).hide();
		$("#selectButton" + this.id).button({
					text: false,
					icons: {
						secondary: "ui-icon-triangle-1-s"
					}
				});
		$("#selectButton" + this.id).click(function() {
			$("#selectMenu" + that.id).show();
			return false;
		});
	}

}