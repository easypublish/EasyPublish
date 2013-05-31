$(function() { 
	var easyPub = new EasyPublish();
});

EasyPublish.prototype.constructor = EasyPublish;
function EasyPublish() {

	var editors = {};

	var that = this;
	this.fieldManager = new FieldManager();
	var dnd = new DragAndDrop(this);
	var dataManager = new DataManager(this);
	var validator = new Validator();

	var importIndex = 0;
	var importedData = {
		numRows:0
	};


	var alignmentCount = 1;
	var authorCount = 1;
	var store_credentials = false;
	var local_storeage = false;

	var dialogPosition  = {my: "top", at: "top", of: $("#middleCol")};

	var dataSelect = $('#dataSelect');
	dataSelect.selectmenu({
		style:'popup',
		width: 300,
	    change: function(e, object){
	        setImportIndex(dataSelect.selectmenu("index"), false);
	    }
	});
	dataSelect.selectmenu('disable');

	$('#csvHelpDialog').dialog({
		autoOpen:false,
		position:dialogPosition
	});
	$('#oauthErrorDialog').dialog({
		autoOpen:false,
		position:dialogPosition
	});
	$('#storeHelpDialog').dialog({
		autoOpen:false,
		position:dialogPosition
	});

	function supports_html5_storage() {
	  try {
	    return 'localStorage' in window && window['localStorage'] !== null;
	  } catch (e) {
	    return false;
	  }
	}
	if(supports_html5_storage()) {
		local_storage = true;
		var storedCreds = localStorage.getItem("store_credentials");
		if(storedCreds=="true") {
			store_credentials = true;
			$("#store_cred").attr('checked', true);
			$("#store_state").html("(stored)");
			restoreCredentials();
		} else {
			$("#store_cred").attr('checked', false);
		}
	} else {
		$("#store_cred_row").hide();
		local_storeage = false;
	}

	$("#store_cred").change(function() {
		//var checked = $("#store_cred").val();
		if(this.checked) {
			console.log("clicked stored");
			store_credentials = true;
			localStorage.setItem("store_credentials", true);
			storeAllCredentials();
			$("#store_state").html("(stored)");
		} else {
			console.log("clicked unstored");
			store_credentials = false;
			localStorage.setItem("store_credentials", false);
			clearAllCredentials();
			$("#store_state").html("(not stored)");
		}
	});

	$(".oauth").change(function() {
		if(store_credentials) {
			storeCredential(this);
		}
	});

	function clearAllCredentials() { 
		$(".oauth").each(function( index ){
			var id = $(this).attr("id");
			localStorage.removeItem(id);
		});
	}

	function restoreCredentials() { 
		$(".oauth").each(function( index ){
			var id = $(this).attr("id");
			var value = localStorage.getItem(id);
			$(this).val(value);
		});
	}

	function storeAllCredentials() { 
		$(".oauth").each(function( index ){
			storeCredential($(this));
		});
	}

	function storeCredential(credField) {
		if(local_storage) {
			var id = $(credField).attr("id");
			var value = $(credField).val();
			console.log("storing credential: " + id + ", val: " + value);
			localStorage.setItem(id, value);
		}
	}
	function edFrameworkSelected(event) {
		var id = $(event.currentTarget).attr("id")
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

	function buildForm(name, fields) {
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
	buildForm("main", this.fieldManager.mainFields);
	buildForm("alignment", this.fieldManager.alignmentFields);
	buildForm("author", this.fieldManager.authorFields);
	buildForm("publisher", this.fieldManager.publisherFields);

	var submitButton = $("#Submit");
	submitButton.button();
	submitButton.click(function() {
		var valid = validateAll();
		if(valid) {
			dataManager.submitData();
			//that.submissionSuccessful();
		} else {
			alert("Please correct the indicated problems");
		}
		return false;
	});
	var downloadCSVButton = $("#DownloadCSV");
	downloadCSVButton.button();
	downloadCSVButton.click(function() {
		window.location = "template.csv";
		return false;
	});

	var dlCSVButton = $("#DL_CSV");
	dlCSVButton.button();
	dlCSVButton.click(function() {
		dataManager.downloadData("csv");
		return false;
	});	

	var dlJSONButton = $("#DL_JSON");
	dlJSONButton.button();
	dlJSONButton.click(function() {
		dataManager.downloadData("json");
		return false;
	});


	var storeHelpButton = $("#storeHelp");
	storeHelpButton.button( {
      icons: {
        primary: "ui-icon-help"
      },
      text: false

	});
	storeHelpButton.click(function() {
		$("#storeHelpDialog").dialog( "open" );
		return false;
	});

	var CSVHelpButton = $("#csvHelp");
	CSVHelpButton.button( {
      icons: {
        primary: "ui-icon-help"
      },
      text: false

	});
	CSVHelpButton.click(function() {
		$("#csvHelpDialog").dialog( "open" );
		return false;
	});

	var testDataButton = $("#TestData");
	testDataButton.button();
	testDataButton.click(function() {
		for(key in that.fieldManager.fieldDictionary) {
			var field = that.fieldManager.fieldDictionary[key];
			var data = field.id+"DATA";
			if(field.type==Field.URL) {
				data = "http://www."+data+".com";
			}else if(field.type==Field.DURATION) {
				data = "P5Y";
			}else if(field.type==Field.DATE) {
				data = "2013-01-01";
			}else if(field.type==Field.EMAIL) {
				data = data+"@data.com";
			}else if(field.type==Field.RANGE) {
				data = "1-10";
			}
			field.value(data);
		}
	});

	var previousDataButton = $("#prevData");
	previousDataButton.button({
		icons: {
			primary: "ui-icon-arrowthick-1-w",
		},
		disabled: true 
	});
	previousDataButton.click(function() {
		if(importIndex>0) {
			console.log("previous");
			setImportIndex(--importIndex, true);
		}
		return false;
	});

	var nextDataButton = $("#nextData");
	nextDataButton.button({
		icons: {
			secondary: "ui-icon-arrowthick-1-e",
		},
		disabled: true 
	});
	nextDataButton.click(function() {
		if(importIndex<importedData.numRows-1) {
			console.log("next");
			setImportIndex(++importIndex, true);

		}
		return false;
	});


	var addAuthorButton = $("#addAuthor");
	addAuthorButton.button({
		icons: {
			secondary: "ui-icon-plus",
		}
	});
	addAuthorButton.click(function() {
		addAuthor();
		return false;
	});
	function addAuthor() {
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

	var addAlignmentButton = $("#addAlignment");
	addAlignmentButton.button({
		icons: {
			secondary: "ui-icon-plus",
		}
	});
	addAlignmentButton.click(function() {
		addAlignment();
		return false;
	});
	function addAlignment() {
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

	function setImportIndex(newIndex, updateDataSelect) {
		//storeCurrentImportData();
		importIndex = newIndex;
		setCurrentImportData(importIndex);
    	previousDataButton.button("option", "disabled", importIndex==0);
    	nextDataButton.button("option", "disabled", importIndex==importedData.numRows-1);
    	if(updateDataSelect) {
    		dataSelect.selectmenu("index", importIndex);
    	}
	}


	$( document ).tooltip({ position: { my: "left top", at: "right+15 top", collision: "flipfit" } });

	this.submissionSuccessful = function() {
		console.log("submissionSuccessful");
		if(importedData.numRows>0) {
	    	for(key in importedData) {
	    		if(key!="numRows") {
	            	importedData[key].splice(importIndex, 1);
	            }
	    	}
		}
		importedData.numRows--;
		if(importedData.numRows>0) {
			while(importIndex>importedData.numRows-1) {
				importIndex--;
			}
        	setCurrentImportData(importIndex);
        } else {
        	clearFields();
        }
        buildDataSelections();
	}

	this.fileDropped = function(fileData) {
        var arrData = dataManager.CSVToArray(fileData);
        var objData = dataManager.twoDArrayToObjectArray(arrData);
        var valid = validateImportData(arrData);
        if(valid) {
			var rowCount = arrData.length;
	        $("#dropStatus2").append("Found " + rowCount + " row(s) of data");
        	importedData = objData;
        	console.log("importedData: ");
        	console.log(importedData);
        	importIndex = 0;
        	previousDataButton.button("option", "disabled", true);
        	if(rowCount>1) {
        		nextDataButton.button("option", "disabled", false);
        	}
        	buildDataSelections();
        	setCurrentImportData(importIndex);
	    }
    }

    function buildDataSelections() {
    	dataSelect.selectmenu("destroy")
    	dataSelect.empty();
    	if(importedData.numRows>0) {
	    	var sel = true;
	    	for(var i=0; i<importedData.numRows; i++) {
	    		var name = importedData.title[i];
				if(sel) {
					var option = "<option value='"+name+" selected='selected'>"+name+"</option>";
					sel = false;
				} else {
	    			var option = "<option value='"+name+"'>"+name+"</option>";
	    		}
	    		dataSelect.append(option);

	    	}
	    	dataSelect.selectmenu({
				style:'popup',
				width: 300,
			    change: function(e, object){
			        setImportIndex(dataSelect.selectmenu("index"), false);
			    }
			});
			dataSelect.selectmenu('enable');
    		dataSelect.selectmenu("index", importIndex);
		}else{
			dataSelect.append("<option value='No Data'>No Data</option>");
			dataSelect.selectmenu({
				style:'popup',
				width: 300,
			    change: function(e, object){
			        setImportIndex(dataSelect.selectmenu("index"), false);
			    }
			});
			dataSelect.selectmenu('disable');
		}
    }

    function storeCurrentImportData() {
    	for(key in importedData) {
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                importedData[key][importIndex] = field.value();
            }
    	}
    }


    function setCurrentImportData(index) {
    	for(key in importedData) {
            var field = that.fieldManager.fieldDictionary[key];
            if (field) {
                field.value(importedData[key][index]);
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

    var importFailDialogTemplate = null;
    var importWarningDialogTemplate = null;
    function validateImportData(arrData) {
    	var header = arrData[0];
    	var fields = _.keys(that.fieldManager.fieldDictionary);
    	var intersection = _.intersection(header, fields);
    	var extraHeaders = _.difference(header, intersection);
    	var missingFields = _.difference(fields, intersection);
    	if(missingFields.length>0) {
    		if(!importFailDialogTemplate) {
    			var importFailDialogSrc = document.getElementById("importFailDialogTemplate").innerHTML;
    			importFailDialogTemplate = Handlebars.compile(importFailDialogSrc);
    		}
    		var timestamp = new Date().getTime();
            var tempData = {
                guid:timestamp,
                missingFieldsList:missingFields.join()
            };
			importFailDialogHtml = importFailDialogTemplate(tempData);
            $("body").append(importFailDialogHtml);
            $("#"+timestamp).dialog({position:dialogPosition});
            return false;
    	} else if(extraHeaders.length>0) {
    		if(!importWarningDialogTemplate) {
    			var importWarningDialogSrc = document.getElementById("importWarningDialogTemplate").innerHTML;
    			importWarningDialogTemplate = Handlebars.compile(importWarningDialogSrc);
    		}
    		var timestamp = new Date().getTime();
            var tempData = {
                guid:timestamp,
                extraHeadersList:extraHeaders.join()
            };
			importWarningDialogHtml = importWarningDialogTemplate(tempData);
            $("body").append(importWarningDialogHtml);
            $("#"+timestamp).dialog({position:dialogPosition});
    	}
    	return true;
    }

    this.getOAuthData = function() {
    	var cons_key = $("#consumer_key").val();
    	var cons_sec = $("#consumer_secret").val();
    	var tok_sec = $("#token_secret").val();
    	var n_url = $("#node_url").val();

    	if(cons_key && cons_sec && tok_sec && n_url) {
	    	var oauth_data = {
		        consumer_key: cons_key,
		        consumer_secret: cons_sec,
		        token: 'node_sign_token',
		        token_secret: tok_sec,
		        node_url: n_url
	    	}
	    	return oauth_data;
	    } else {
	    	$('#oauthErrorDialog').dialog("open");
	    	return null;
	    }
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
				    name: [$("#author_name"+i).val()],
		            url:  [$("#author_url"+i).val()],
		            email:  [$("#author_email"+i).val()]
				}
				authors[i-1] = author;
			}
		}
		return authors;
	}

	this.getAlignments = function() {

		console.log("get alignments, fieldDict keys: ");
		var keys = _.keys(this.fieldManager.fieldDictionary);
		console.log(keys);

		var alignments = [];

		var edFramework = this.getValue("educationalFramework");
		console.log("edFramework is:  " + edFramework);
		var alignment0 = {
		    alignmentType: [this.getValue("alignmentType")],
            educationalFramework:  [edFramework]
		}
		if(edFramework && edFramework.trim().length>0) {
			var standardField;
			if(edFramework.lastIndexOf("Math")>=0) {
				standardField = this.fieldManager.fieldDictionary["Math-Standard"];
			} else if(edFramework.lastIndexOf("ELA")>=0) {
				standardField = this.fieldManager.fieldDictionary["ELA-Standard"];
			}
			if(standardField) {
				alignment0.targetUrl = [standardField.treeMenu.getCurrentSelectionData()];
				alignment0.targetName = [standardField.treeMenu.getCurrentSelectionText()];
				console.log("targetUrl is:  " + alignment0.targetUrl);
				console.log("targetName is:  " + alignment0.targetName);
			}
		}
		alignments[0] = alignment0;

		if(alignmentCount>1) {
			for(var i=2; i<=alignmentCount; i++) {
				var edFramework = this.getValue("educationalFramework_"+i);
				console.log("edFramework " + i + " is:  " + edFramework);

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
						console.log("targetUrl " + i + " is:  " + alignment.targetUrl);
						console.log("targetName " + i + " is:  " + alignment.targetName);

					}
				}
				console.log("alignment " + i + " is:  ");
				console.log(alignment);

				alignments[i-1] = alignment;
			}
		}
		return alignments;
	}

	this.getData = function() {
		var data = {};
		for(key in this.fieldManager.fieldDictionary) {
			var field = this.fieldManager.fieldDictionary[key];
			data[field.objectName] = field.value();
		}
	    return data;
	}

	this.getID = function() {
		return this.getValue("consumer_key") + this.getValue("url");
	}

	this.getValue = function(id) {
		var field = this.fieldManager.fieldDictionary[id];
		console.log("getValue for: " + id + ", found field: " + field);
		if(field) {
			return field.value();
		}else {
			return "";
		}
	}

	function validateAll() {
		var valid = true;
		if(importedData.numRows>0) {
			var index = 0;
			while(valid) {
				setImportIndex(index, true);
				valid = validateForm();
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
		//console.log("required: " + field.required);
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

