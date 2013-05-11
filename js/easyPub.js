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

	function buildForm(name, fields) {
		//var form = $("#"+name+"Form");
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
				$("#"+nextField.id).autocombobox();
			}else if (nextField.type==Field.TREE_CHOICE) {
				nextField.treeMenu.initGUI();
			}
		}
	}
	buildForm("main", this.fieldManager.mainFields);
	buildForm("alignment", this.fieldManager.alignmentFields);
	buildForm("author", this.fieldManager.authorFields);
	buildForm("publisher", this.fieldManager.publisherFields);

	var submitButton = $("#Submit");
	submitButton.button();
	submitButton.click(function() {
		var valid = validateForm();
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
	//TODO - very redundant with addAuthor, can refactor and make one parent function for both
	function addAlignment() {
		alignmentCount++;
		$("#addAlignment").before('<div class="sublegend">Alignment '+alignmentCount+'</div>');
		for(var i=0; i<3; i++) {
			var nextField = that.fieldManager.alignmentFields[i];
			var clone = nextField.clone(alignmentCount);
			that.fieldManager.fieldDictionary[clone.id] = clone;
			that.fieldManager.alignmentFields.push(clone);
			var nextRow = new FieldEditorRow(clone, alignmentCount);
			$("#addAlignment").before(nextRow.elem);
			//have to construct combo boxes after they've been added to DOM
			if(clone.type==Field.CHOICE) {
				$("#"+clone.id).autocombobox();
			}
		}
	}

	function setImportIndex(newIndex, updateDataSelect) {
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
		var alignments = [];
		var alignment0 = {
		    alignmentType: [this.getValue("alignmentType")],
            educationalFramework:  [this.getValue("educationalFramework")],
            //targetUrl:  [this.getValue("educationalAlignment_targetURL")],
            targetUrl:  [$("#educationalAlignment_targetURL").autocombobox("selectvalue")]
		}
		alignments[0] = alignment0;
		if(alignmentCount>1) {
			for(var i=2; i<=alignmentCount; i++) {
				var alignment = {
				    alignmentType: [this.getValue("alignmentType"+i)],
		            educationalFramework:  [this.getValue("educationalFramework"+i)],
		            targetUrl:  [$("#educationalAlignment_targetURL"+i).autocombobox("selectvalue")]
				    /*alignmentType: [$("#alignmentType"+i).val()],
		            educationalFramework:  [$("#educationalFramework"+i).val()],
		            targetUrl:  [$("#targetUrl"+i).val()]*/
				}
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
		if(field) {
			return field.value();
		}else {
			return "";
		}
	}


	// This is the validation function:
	function validateForm() {

	    // Start validation:
	    $.validity.start();
	    
	    // Validator methods go here:
	    function validateFields(fields) {
			for(key in fields) {
				var nextField = fields[key];
				nextField.validateField();
				//nextField.input.require();
		    }
		}
		validateFields(that.fieldManager.mainFields);
		validateFields(that.fieldManager.alignmentFields);
		validateFields(that.fieldManager.authorFields);
		validateFields(that.fieldManager.publisherFields);
	    
	    // All of the validator methods have been called:
	    // End the validation session:
	    var result = $.validity.end();
	    
	    console.log("validity result: ");
	    console.log(result);
	    // Return whether it's okay to proceed with the Ajax:
	    return result.valid;
	}




}


FieldEditorRow = function(field) {

	this.elem = $('<div>', {
		class: 'fieldRow'
	});
	var label = $('<label>', {
		text: field.name,
		for: field.id
	});
	label.appendTo(this.elem);
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
	if(field.type==Field.TREE_CHOICE) {
		field.treeMenu.getContainer().appendTo(this.elem);
	}else {
		field.input.appendTo(this.elem);
	}
	$('<br>').appendTo(this.elem);
}


/*
FieldEditorRow = function(field) {

	this.elem = $('<tr>');
	var labelTD = $('<td>');
	var label = $('<span>', {
		text: field.name
	});
	label.appendTo(labelTD);
	if(field.required) {
		//console.log("required: " + field.required);
		var requiredStar = $('<span>', {
			text: '*',
			title: 'Required field'
		});
		requiredStar.css("color", "red");
		requiredStar.appendTo(labelTD);
	}
	labelTD.appendTo(this.elem);
	var inputTD = $('<td>');
	field.input.appendTo(inputTD);
	inputTD.appendTo(this.elem); 

}*/
