$(function() { 
	// var easyPub = new EasyPublish();
});

EasyPublish.prototype.constructor = EasyPublish;
function EasyPublish(edit_data) {

	var editors = {};

	var that = this;
	this.fieldManager = new FieldManager();
	var dnd = new DragAndDrop(this);
    dnd.bind("csvFile");
    
	this.dataManager = new DataManager(this);
	var validator = new Validator();

	this.importIndex = 0;
	this.importedData = {
		numRows:0
	};

	var alignmentCount = 1;
	var authorCount = 1;

	var dialogPosition  = {my: "top", at: "top", of: $("#middleCol")};
	
	function updateEdFramework(id) {
		var selection = $("#"+id).val();
		var indexLoc = id.lastIndexOf("_");
		var index = "";
		if(indexLoc>=0) {
			index = id.slice(indexLoc);
		};
		var mathRow = "#Math-Standard" + index + "Row";
		var elaRow = "#ELA-Standard" + index + "Row";
		if(selection.indexOf("Math")>=0) {
			$(mathRow).show();
			$(elaRow).hide();
		} else if(selection.indexOf("Language")>=0) {
			$(mathRow).hide();
			$(elaRow).show();
		}else {
			$(mathRow).hide();
			$(elaRow).hide();
		}
	}

	function edFrameworkSelected(event) {
		var id = $(event.currentTarget).attr("id");
		updateEdFramework(id);
	}

	this.buildForm = function(name, fields) {
		var formSection = $("#"+name+"Form");

		for(key in fields) {
			var nextField = fields[key];
			var nextRow = new FieldEditorRow(nextField);
			if(name=="author") {
				$("#addAuthor").before(nextRow.elem);
			} else if(name=="alignment") {
				$("#addAlignment").before(nextRow.elem);
			}  else {	
				nextRow.elem.appendTo(formSection);	
			}
			//have to construct combo boxes after they've been added to DOM
			if(nextField.type==Field.CHOICE) {
				if(nextField.id=="educationalFramework") {
					//for educationalFramework specifically, we don't make it an autocombobox,
					//just leave it as a <select>. on the other hand, and a change listener so
					//we can show/hide the Math vs. ELA subject menus accordingly
					$("#"+nextField.id).change(edFrameworkSelected);
				} else {
					$("#"+nextField.id).autocombobox();
				}
			}else if (nextField.type==Field.TREE_CHOICE || nextField.type==Field.STANDARDS_TREE_CHOICE) {
				nextField.treeMenu.initGUI();
			}
		}
		$("#ELA-StandardRow").hide();
		$("#Math-StandardRow").hide();
	}

	if (edit_data != undefined) {
		setEditData(this.dataManager.mapPayloadToFields(edit_data.resource_data.items[0].properties));
	}


	this.addAuthor = function () {
		authorCount++;
		$("#addAuthor").before('<div class="sublegend">Author '+authorCount+'</div>');
		for(var i=0; i<3; i++) {
			var nextField = that.fieldManager.authorFields[i];
			var clone = nextField.clone(authorCount);
			that.fieldManager.fieldDictionary[clone.id] = clone;
			that.fieldManager.authorFields.push(clone);
			var nextRow = new FieldEditorRow(clone, authorCount);
			$("#addAuthor").before(nextRow.elem);
			//have to construct combo boxes after they've been added to DOM
			if(clone.type==Field.CHOICE) {
				$("#"+clone.id).autocombobox();
			}
		}
	}

	this.addAlignment = function () {
		alignmentCount++;
		$("#addAlignment").before('<div class="sublegend">Alignment '+alignmentCount+'</div>');
		for(var i=0; i<4; i++) {
			var nextField = that.fieldManager.alignmentFields[i];
			var clone = nextField.clone(alignmentCount);
			that.fieldManager.fieldDictionary[clone.id] = clone;
			that.fieldManager.alignmentFields.push(clone);
			var nextRow = new FieldEditorRow(clone, alignmentCount);
			$("#addAlignment").before(nextRow.elem);

			//have to construct combo boxes after they've been added to DOM
			if(clone.type==Field.CHOICE) {
				if(clone.id=="educationalFramework_"+alignmentCount) {
					//for educationalFramework specifically, we don't make it an autocombobox,
					//just leave it as a <select>. on the other hand, and a change listener so
					//we can show/hide the Math vs. ELA subject menus accordingly
					$("#"+clone.id).change(edFrameworkSelected);
				} else {
					$("#"+clone.id).autocombobox();
				}
			}else if (clone.type==Field.TREE_CHOICE || clone.type==Field.STANDARDS_TREE_CHOICE) {
				clone.treeMenu.initGUI();
			}
		}
		$("#Math-Standard_" + alignmentCount+ "Row").hide();
		$("#ELA-Standard_"+ alignmentCount + "Row").hide();
	}

	this.setImportIndex = function(newIndex, updateDataSelect, storeCurrent) {
		if(storeCurrent) {
			storeCurrentImportData();
		}
		that.importIndex = newIndex;
		that.setCurrentImportData(that.importIndex);
    	$('#prevData').button("option", "disabled", that.importIndex==0);
    	$('#nextData').button("option", "disabled", that.importIndex==that.importedData.numRows-1);
        $('#removeRow').button("option", "disabled", that.importedData.numRows==0);
    	if(updateDataSelect) {
    		$('#dataSelect').selectmenu("index", that.importIndex);
    	}
	}


	this.fileDropped = function(fileData) {
        var arrData = this.dataManager.CSVToArray(fileData);
        var objData = this.dataManager.twoDArrayToObjectArray(arrData, this.fieldManager.englishNameDictionary);
        var valid = true; //validateImportData(arrData);
        if(valid) {
			var rowCount = arrData.length;
	        $("#dropStatus2").append("Found " + rowCount + " row(s) of data");
        	that.importedData = objData;
        	that.importIndex = 0;
        	$('#prevData').button("option", "disabled", true);
        	if(rowCount>1) {
        		$('#nextData').button("option", "disabled", false);
                $('#removeRow').button("option", "disabled", false);
        	}
        	buildDataSelections();
        	that.setCurrentImportData(that.importIndex);
	    }
    }

    function buildDataSelections() {
    	var dataSelect = $('#dataSelect');
    	dataSelect.selectmenu("destroy")
    	dataSelect.empty();
    	if(that.importedData.numRows>0) {
	    	var sel = true;
	    	for(var i=0; i<that.importedData.numRows; i++) {
	    		var name = that.importedData.title[i];
                var title = "-- UNDEFINED TITLE --";
                if (name.trim().length > 0) {
                    title = name;
                }
				if(sel) {
					var option = "<option value='"+name+" selected='selected'>"+title+"</option>";
					sel = false;
				} else {
	    			var option = "<option value='"+name+"'>"+title+"</option>";
	    		}
	    		dataSelect.append(option);

	    	}
	    	dataSelect.selectmenu({
				style:'popup',
				width: 300,
			    change: function(e, object){
			        that.setImportIndex(dataSelect.selectmenu("index"), false, true);
			    }
			});
			dataSelect.selectmenu('enable');
    		dataSelect.selectmenu("index", that.importIndex);
		}else{
			dataSelect.append("<option value='No Data'>No Data</option>");
			dataSelect.selectmenu({
				style:'popup',
				width: 300,
			    change: function(e, object){
			        that.setImportIndex(dataSelect.selectmenu("index"), false, true);
			    }
			});
			dataSelect.selectmenu('disable');
		}
    }

    function storeCurrentImportData() {
    	//console.trace();
    	for(key in that.importedData) {
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                that.importedData[key][that.importIndex] = field.value();
            }
    	}
    }

    this.getNumImportRows = function() {
    	return that.importedData.numRows;
    }

    this.setCurrentImportData = function(index) {
    	//console.trace();
        var mathTest = /[\w]*Math[\w]*/;
        var elaTest = /[\w]*Language[\w]*/;
    	var indexTest = /([\w]*)_(\d+)$/;
    	var authorTest = /[\w]*author[\w]*/;
    	var alignmentTest = /[\w]*(alignmentType|educationalFramework|Standard)[\w]*/;

    	for(var key in that.importedData) {
    		if(key=="numRows") {
    			continue;
    		}
            var val = that.importedData[key][index];
        	if(key.match(indexTest)) {
        		match = indexTest.exec(key);
        		var base = match[1];
        		var key_index = match[2];
        		if(key.match(authorTest)) {
        			if(key_index>authorCount) {
        				that.addAuthor();
        			}
        		} else if (key.match(alignmentTest)) {
        			if(key_index>alignmentCount) {
        				that.addAlignment();
        			}
        		}
        	}
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                field.value(val);
            } else {
            	console.log("no field found for key: " + key + ", val: " +  val);
            }
        	if(key.lastIndexOf("educationalFramework")>=0) {
        		updateEdFramework(key);
        	}
    	}
    }

    function setEditData(data) {
    	//console.trace();
        var mathTest = /[\w]*Math[\w]*/;
        var elaTest = /[\w]*Language[\w]*/;
    	var indexTest = /([\w]*)_(\d+)$/;
    	var authorTest = /[\w]*author[\w]*/;
    	var alignmentTest = /[\w]*(alignmentType|educationalFramework|Standard)[\w]*/;

    	for(var key in data) {
            var val = data[key];
        	if(key.match(indexTest)) {
        		match = indexTest.exec(key);
        		var base = match[1];
        		var key_index = match[2];
        		if(key.match(authorTest)) {
        			if(key_index>authorCount) {
        				that.addAuthor();
        			}
        		} else if (key.match(alignmentTest)) {
        			if(key_index>alignmentCount) {
        				that.addAlignment();
        			}
        		}
        	}
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                field.value(val);
            } else {
            	console.log("no field found for key: " + key + ", val: " +  val);
            }
        	if(key.lastIndexOf("educationalFramework")>=0) {
        		updateEdFramework(key);
        	}
    	}
    }

    function clearFields() {
    	for(key in that.fieldManager.fieldDictionary) {
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                field.value("");
            }
    	}
    }

    function validateImportData(arrData) {
		var importFailDialogSrc = null;
		var importWarningDialogSrc = null;
    	var header = arrData[0];
    	var fields = _.keys(that.fieldManager.fieldDictionary);
    	var intersection = _.intersection(header, fields);
    	var extraHeaders = _.difference(header, intersection);
    	var missingFields = _.difference(fields, intersection);
    	if(missingFields.length>0) {
    		if(!importFailDialogSrc) {
    			var importFailDialogSrc = document.getElementById("importFailDialogTemplate").innerHTML;
    		}
    		var timestamp = new Date().getTime();
            var tempData = {
                guid:timestamp,
                missingFieldsList:missingFields.join()
            };
			importFailDialogHtml = _.template(importFailDialogSrc, tempData);
            $("body").append(importFailDialogHtml);
            $("#"+timestamp).dialog({position:dialogPosition});
            return false;
    	} else if(extraHeaders.length>0) {
    		if(!importWarningDialogSrc) {
    			var importWarningDialogSrc = document.getElementById("importWarningDialogTemplate").innerHTML;
    		}
    		var timestamp = new Date().getTime();
            var tempData = {
                guid:timestamp,
                extraHeadersList:extraHeaders.join()
            };
			importWarningDialogHtml = _.template(importWarningDialogSrc, tempData);
            $("body").append(importWarningDialogHtml);
            $("#"+timestamp).dialog({position:dialogPosition});
    	}
    	return true;
    }

    this.getOAuthData = function() {
    	var oauth_data = storedCredentials.oauth;
	    return oauth_data;
	}

	this.getAuthors = function() {
		var authors = [];
		var author0 = {
		    name: [this.getValue("author_name")],
            url:  [this.getValue("author_url")],
            email:  [this.getValue("author_email")]
		}
		authors[0] = author0;
		if(authorCount>1) {
			for(var i=2; i<=authorCount; i++) {
				var author = {
				    name: [$("#author_name_"+i).val()],
		            url:  [$("#author_url_"+i).val()],
		            email:  [$("#author_email_"+i).val()]
				}
				authors[i-1] = author;
			}
		}
		return authors;
	}

	this.getAlignments = function() {

		var keys = _.keys(this.fieldManager.fieldDictionary);

		var alignments = [];

		var edFramework = this.getValue("educationalFramework");
		var alignment0 = {
		    alignmentType: [this.getValue("alignmentType")],
            educationalFramework:  [edFramework]
		}
		if(edFramework && edFramework.trim().length>0) {
			var standardField;
			if(edFramework.lastIndexOf("Math")>=0) {
				standardField = this.fieldManager.fieldDictionary["Math-Standard"];
			} else if(edFramework.lastIndexOf("Language")>=0) {
				standardField = this.fieldManager.fieldDictionary["ELA-Standard"];
			}
			if(standardField) {
				alignment0.targetUrl = [standardField.treeMenu.getCurrentSelectionData()];
				alignment0.targetName = [standardField.treeMenu.getCurrentSelectionText()];
			}
		}
		alignments[0] = alignment0;

		if(alignmentCount>1) {
			for(var i=2; i<=alignmentCount; i++) {
				var edFramework = this.getValue("educationalFramework_"+i);

				var alignment = {
				    alignmentType: [this.getValue("alignmentType_"+i)],
		            educationalFramework:  [edFramework]
				}
				if(edFramework && edFramework.trim().length>0) {
					var standardField;
					if(edFramework.lastIndexOf("Math")>=0) {
						standardField = this.fieldManager.fieldDictionary["Math-Standard_"+i];
					} else if(edFramework.lastIndexOf("ELA")>=0) {
						standardField = this.fieldManager.fieldDictionary["ELA-Standard_"+i];
					}
					if(standardField) {
						alignment.targetUrl = [standardField.treeMenu.getCurrentSelectionData()];
						alignment.targetName = [standardField.treeMenu.getCurrentSelectionText()];

					}
				}

				alignments[i-1] = alignment;
			}
		}
		return alignments;
	}

	this.getData = function(byEnglishName) {
		var data = {};
		for(key in this.fieldManager.fieldDictionary) {
			var field = this.fieldManager.fieldDictionary[key];
			if(byEnglishName) {
				data[field.name] = field.value();
			} else {
				data[key] = field.value();
			}
		}
	    return data;
	}

	this.getID = function() {
		return this.getValue("consumer_key") + this.getValue("url");
	}

	this.getValue = function(id) {
		var field = this.fieldManager.fieldDictionary[id];
		if(field) {
			return field.value();
		}else {
			return "";
		}
	}

	this.validateAll = function () {
		var valid = true;
		storeCurrentImportData();
		if(that.importedData.numRows>0) {
			var index = 0;
			while(valid && index<that.importedData.numRows) {
				that.setImportIndex(index, true);
				valid = validateForm();
				index++;
			}
			return valid;
		} else {
			return validateForm();
		}

	}
	function validateForm() {
	    var valid = true;
	    function validateFields(fields) {
			for(key in fields) {
				var nextField = fields[key];
				var message = validator.validateField(nextField);
				if(message!="") {
					valid = false;
					$("#"+nextField.id+"Error").html("("+message+")");
				} else {
					$("#"+nextField.id+"Error").html("");
				}
		    }
		}
		validateFields(that.fieldManager.mainFields);
		validateFields(that.fieldManager.alignmentFields);
		validateFields(that.fieldManager.authorFields);
		validateFields(that.fieldManager.publisherFields);
	    return valid;
	}


}


FieldEditorRow = function(field) {

	this.elem = $('<div>', {
		class: 'fieldRow',
		id: field.id+"Row"
	});
	var label = $('<label>', {
		text: field.name,
		for: field.id
	});
	var errorLabel = $('<span>', {
		text: "",
		id: field.id+"Error",
		class: "error"
	});
	label.appendTo(this.elem);
	errorLabel.appendTo(this.elem);
	if(field.required) {
		var requiredStar = $('<span>', {
			text: '*',
			title: 'Required field'
		});
		requiredStar.css("color", "red");
		requiredStar.appendTo(label);
	}
	$('<br>').appendTo(this.elem);
	if(field.type==Field.TREE_CHOICE || field.type==Field.STANDARDS_TREE_CHOICE) {
		field.treeMenu.getContainer().appendTo(this.elem);
	}else {
		field.input.appendTo(this.elem);
	}
	$('<br>').appendTo(this.elem);
}