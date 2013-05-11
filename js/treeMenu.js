function TreeMenu(id) {
	this.id = id;
	that = this;

	this.container = $('<div>', {
		id: this.id,
		name: this.id,
		title : this.tip
	});

	this.input = $('<input>', {
		id : "selection" + this.id,
		type: "text"
	});
	this.input.appendTo(this.container);

	this.button = $('<button>', {
		id : "selectButton" + this.id
	});
	this.button.appendTo(this.container);

	this.menu = $('<ul>', {
		id : "selectMenu" + this.id
	});
	this.menu.appendTo(this.container);

	var selected = function( event, ui ) {
		var selectedText = ui.item.text();
		var selectedTextArray=selectedText.split("\n");
		for(key in selectedTextArray) {
			var next = selectedTextArray[key];
			next = next.trim();
			if(next.trim().length>0) {
				selectedText = next;
				break;
			}
		}
		//console.log( "Selected: [" + selectedText +"]");
		$("#selection" + that.id).val(selectedText);
		$("#selectMenu" + that.id).hide();
	}

	this.getContainer = function() {
		return this.container;
	}

	this.getInput = function() {
		return this.input;
	}

	var extendMenu = function(list, children) {
		for(key in children) {
			var child = children[key];
			var item = $('<li>');
			var link = $('<a>', {
				text : child.name
			});
			link.appendTo(item);
			if(child.children && child.children.length>0) {
				var sublist = $('<ul>');
				extendMenu(sublist, child.children);
				sublist.appendTo(item);
			}
			item.appendTo(list);
		}
		return list;
	}

	this.setChoices = function(choiceTree) {
		var children = choiceTree.children;
		extendMenu(this.menu, children);
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