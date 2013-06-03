function CCSS() {

	/*buildStandardElement = function(standard) {
		var listElem = $('<li>', {
			class: 'standardListItem'
		});
		var link = $('<a>', {
			href: standard.URI,
			text: standard.DotNotation
		});
		link.appendTo(listElem);
		return listElem;
	}*/

	buildStandardElement = function(standard, key) {
		var listElem = $('<li>');
		var link = $('<a>', {
			style: "font-weight:bold;",
			text: key + " "
		});
		link.attr("value", standard.URI);
		link.attr("dotNotation", standard.DotNotation);
		link.appendTo(listElem);
		listElem.addClass("ui-menu-multilevel");
		return listElem;
	}
	buildStandardsList = function(tree, dots, rootList) {
		var list;
		if(rootList) {
			list = rootList;
		} else {
			list = $('<ul>');
		}
		for(key in tree) {
			if(key=="standard") {
				continue;
			}
			var subDots;
			if(dots) {
				subDots = dots + "." + key;
			} else {
				subDots = key;
			}
			//console.log(subDots);
			var branch = tree[key];
			var item;
			if(branch.standard) {
				item = buildStandardElement(branch.standard, key);
				item.appendTo(list);
			} else {
				item = $('<li>');
				var linkObj = {
					text : key
				};
				var link = $('<a>', linkObj);
				link.appendTo(item);
				item.appendTo(list);
			}
			if(_.size(branch)>1) {
				var subList = buildStandardsList(branch, subDots);
				if(subList) {
					subList.appendTo(item);
				}
			}
		}
 		return list;
	}

	this.buildStandardsListElement = function(rootList, choices) {
		var list = buildStandardsList(choices, "", rootList);
		return list;
	}

	//var list = buildStandardsListElement(standardsTree);
	//$("#standardList").append(list);

	//this function exists for rebuilding the standardsTree Object (standardsTree.js) from the standardsArray Object (standardsArray.js)
	this.buildStandardsTree = function() {
		var standardsTree = {};
		for(key in standardsArray) {
			var standard = standardsArray[key];
			var dotNot = standard.DotNotation;
			var dots = dotNot.split(".");
			if(!standardsTree[dots[0]]) {
				standardsTree[dots[0]] = {};
			}
			if(!standardsTree[dots[0]][dots[1]]) {
				standardsTree[dots[0]][dots[1]] = {};
			}
			if(!standardsTree[dots[0]][dots[1]][dots[2]]) {
				standardsTree[dots[0]][dots[1]][dots[2]] = {};
			}
			if(!dots[3]) {
				standardsTree[dots[0]][dots[1]][dots[2]].standard = standard;
			} else {
				if(!standardsTree[dots[0]][dots[1]][dots[2]][dots[3]]) {
					standardsTree[dots[0]][dots[1]][dots[2]][dots[3]] = {};
				}
				if(!dots[4]) {
					standardsTree[dots[0]][dots[1]][dots[2]][dots[3]].standard = standard;
				} else {

					if(!standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]]) {
						standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]] = {};
					}
					if(!dots[5]) {
						standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]].standard = standard;
					}else {
						if(!standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]]) {
							standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]] = {};
						}
						if(!dots[6]) {
							standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]].standard = standard;
						}else {
							if(!standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]][dots[6]]) {
								standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]][dots[6]] = {};
							}
							standardsTree[dots[0]][dots[1]][dots[2]][dots[3]][dots[4]][dots[5]][dots[6]].standard = standard;
						}
					}

				}
			} 
		}

		console.log(standardsTree);
		console.log(JSON.stringify(standardsTree));
	}
}