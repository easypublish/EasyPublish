$(function() {
	// var easyPub = new EasyPublish();
});

require("lib/csvToArray");

var gen_standards = require("lib/gen/standards");

EasyPublish.prototype.constructor = EasyPublish;
function EasyPublish() {

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

    this.bindings = {};
	var alignmentCount = 1;
	var authorCount = 1;

	var dialogPosition  = {my: "top", at: "top", of: $("#middleCol")};

    this.bind = function(event, callback){
        this.bindings[event] = this.bindings[event] || [];
        this.bindings[event].push(callback);
    }

    this.fireEvent = function(event, data) {
        _.each(this.bindings[event], function(cb){ cb(this.data) }, {data: data})
    }

	this.buildForm = function(name, fields) {
		var formSection = $("#"+name+"Form");

		for(key in fields) {
			var nextField = fields[key];
			var nextRow = new FieldEditorRow(nextField);
			if(name=="author") {
				$("#addAuthor").before(nextRow.elem);
			} else {
				nextRow.elem.appendTo(formSection);
			}
			//have to construct combo boxes after they've been added to DOM
			if(nextField.type==Field.CHOICE) {

            }else if (nextField.type==Field.MULTI_CHOICE || nextField.type==Field.GROUPED_MULTI_CHOICE){

			}else if (nextField.type==Field.TREE_CHOICE || nextField.type==Field.STANDARDS_TREE_CHOICE) {
				nextField.treeMenu.initGUI();
			}
		}
        // enable multi-choice ui
        $(".multi-choice").chosen({width:"375px"});
	}

	this.addAuthor = function () {
		authorCount++;
		$("#addAuthor").before('<div class="sublegend">Author '+authorCount+'</div>');
		for(var i=0; i<4; i++) {
			var nextField = that.fieldManager.authorFields[i];
			var clone = nextField.clone(authorCount);
			that.fieldManager.fieldDictionary[clone.id] = clone;
			that.fieldManager.authorFields.push(clone);
			var nextRow = new FieldEditorRow(clone, authorCount);
			$("#addAuthor").before(nextRow.elem);
		}
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

	// For global replacement of row delimiters
	String.prototype.replaceAll = function(expression, result) {
		var textToSearch = this;
		return textToSearch.replace(new RegExp(expression, 'g'), result);
	};

	this.fileDropped = function(fileData) {
        var quote_char = Preferences.getPreference("csv-quote-char", "\"").escapedValue(),
            col_delim = Preferences.getPreference("csv-col-delim", ",").escapedValue(),
            row_delim = "\n"; // no longer a pref
        // var arrData = this.dataManager.CSVToArray(fileData);
		// Convert rows to just an "\n" delimiter
        var rowParsed = fileData.replaceAll("\r","\n");
        rowParsed = rowParsed.replaceAll("\n\n","\n");

        var arrData = rowParsed.csvToArray({fSep: col_delim, rSep:row_delim, quot:quote_char, trim:true});
        var objData = this.dataManager.twoDArrayToObjectArray(arrData, this.fieldManager);
		var rowCount = objData.numRows;
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
        that.fireEvent("fileDropped");
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
        		}
                // else if (key.match(alignmentTest)) {
                //     if(key_index>alignmentCount) {
                //     	that.addAlignment();
                //     }
                // }
        	}

            var field = that.fieldManager.fieldDictionary[key];

            if (field) {
                field.value(val);
            } else {
            	console.log("no field found for key: " + key + ", val: " +  val);
            }
    	}
    }

    this.convertToMicrodata = function(lrmidata) {
        var jsonldUtil = require("lib/jsonldUtil");
        return jsonldUtil.getResourceDataAsMicrodata(lrmidata);
    };

    this.setEditData = function(lrmidata) {
        var resource_data = this.convertToMicrodata(lrmidata);
    	data = this.dataManager.mapPayloadToFields(resource_data.items[0].properties);

        var mathTest = /[\w]*Math[\w]*/;
        var elaTest = /[\w]*Language[\w]*/;
    	var indexTest = /([\w]*)_(\d+)$/;
    	var authorTest = /[\w]*author[\w]*/;
    	var alignmentTest = /[\w]*(alignmentType|educationalFramework|Standard)[\w]*/;

    	_.each(_.union(_.keys(that.fieldManager.fieldDictionary), _.keys(data)), function (key) {

        	if(key.match(indexTest)) {
        		match = indexTest.exec(key);
        		var base = match[1];
        		var key_index = match[2];
        		if(key.match(authorTest)) {
        			if(key_index>authorCount) {
        				that.addAuthor();
        			}
        		}
                // else if (key.match(alignmentTest)) {
        		// 	if(key_index>alignmentCount) {
        		// 		that.addAlignment();
        		// 	}
        		// }
        	}
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                var default_val = "";
                if (field.option_default && field.option_lookup) {
                    var lookup = field.option_lookup(field.option_default);
                    if (lookup)
                        default_val = lookup.value;
                }
                var val = data[key] || default_val;
                field.value(val);
            } else {
            	console.log("no field found for key: " + key);
            }
    	});
    }

    function clearFields() {
    	for(key in that.fieldManager.fieldDictionary) {
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                field.value("");
            }
    	}
    }

    this.validateImportData = function () {
    	var fields = that.fieldManager.fieldDictionary;
    	var messages = [];
    	var totalValidRows = 0;
    	var totalErrorRows = 0;


    	for (var i=0; i<that.importedData.numRows; i++) {
    		var rowMessages = {valid:true};
	    	for(key in fields) {
				var nextField = fields[key];
				if (typeof that.importedData[key] != 'undefined'){
				var message = validator.validateField(nextField, that.importedData[key][i]);
				} else if (nextField.required == true) {
					rowMessages.valid = false;
				}

				if(message!="") {
					rowMessages[key] = message;
					rowMessages.valid = false;
				}

				}

			messages.push(rowMessages);
			if (rowMessages.valid) {
				totalValidRows++;
			} else {
				totalErrorRows++;
			}
		}

		return {
			totalValidRows: totalValidRows,
			totalErrorRows: totalErrorRows,
			messages: messages
		};
    }

    this.getOAuthData = function() {
    	var oauth_data = storedCredentials.oauth;
	    return oauth_data;
	}

	this.getAuthors = function() {
		var authors = [];

		//If user uploads author type, convert to full id - can now upload type or full id
		var authorConverted = this.getValue("author_type");

		// Flag for whether or not an author has been converted, if it hasn't, it sends the default option
		var converted = false;
        var default_author_type = "http://schema.org/Organization";

		// Dictionaries for what other options to look for in Author
		var orgDictionary = ["Organization", "organization", "ORGANIZATION"];
		var personDictionary = ["Person", "person", "PERSON"];

		for (j=0; j <= personDictionary.length; j++){
			if (authorConverted == orgDictionary[j])  {
				authorConverted = "http://schema.org/Organization";
				converted = true;
			}
			else if (authorConverted == personDictionary[j]) {
				authorConverted = "http://schema.org/Person";
				converted = true;
			}
		}
        if (converted == false){
            authorConverted = default_author_type; //Sends over the default option instead of null value.
        }

		var author0 = {
            "@type": authorConverted,
		    name: this.getValue("author_name"),
            url:  this.getValue("author_url"),
            email:  this.getValue("author_email")
		}
		authors[0] = author0;

		if(authorCount>1) {
			for(var i=2; i<=authorCount; i++) {

    			converted = false;
    			var authorConvertedSecond = this.getValue("author_type_"+i);

    			for (j=0; j <= personDictionary.length; j++){
    				if (authorConvertedSecond == orgDictionary[j])  {
    					authorConvertedSecond = "http://schema.org/Organization";
    					converted = true;
    				}
    				else if (authorConvertedSecond == personDictionary[j]) {
    					authorConvertedSecond = "http://schema.org/Person";
    					converted = true;
    				}
    			}

                if (converted == false) {
                    authorConvertedSecond = default_author_type; //Sends over the default option instead of null value.
                }

				var author = {
                    "@type": authorConvertedSecond,
				    name: this.getValue("author_name_"+i),
		            url:  this.getValue("author_url_"+i),
		            email:  this.getValue("author_email_"+i)
				}
				authors[i-1] = author;
			}
		}
		return authors;
	}

	this.getAlignments = function() {

        var fieldWrappers = this.fieldManager.alignmentFields;
        var alignments = [];
        _.each(fieldWrappers, function(fieldWrapper) {
            var fieldValues = fieldWrapper.value();
            _.each(fieldValues, function(fieldVal) {
                var align_info = gen_standards.find(fieldVal);
                if (align_info) {
                    var newalign = {
                        educationalFramework: align_info.fw,
                        alignmentType: fieldWrapper.cat_val,
                        targetUrl: align_info.uri,
                        targetName: align_info.dotnotation
                    };
                    alignments.push(newalign);

                }
            });

        }, this);

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