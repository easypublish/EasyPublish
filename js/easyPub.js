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

	function buildForm(name, fields) {
		//var form = $("#"+name+"Form");
		var formSection = $("#"+name+"Form");

		for(key in fields) {
			var nextField = fields[key];
			var nextRow = new FieldEditorRow(nextField);
			nextRow.elem.appendTo(formSection);	
			//have to construct combo boxes after they've been added to DOM
			if(nextField.type==Field.CHOICE) {
				$("#"+nextField.id).autocombobox();
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
			//dataManager.submitData();
			that.submissionSuccessful();
		} else {
			alert("Please correct the indicated problems");
		}

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
	    		var name = importedData.Name[i];
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
    	for(key in importedData) {
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

	this.getData = function() {
		var data = {};
		for(key in this.fieldManager.fieldDictionary) {
			var field = this.fieldManager.fieldDictionary[key];
			data[field.objectName] = field.value();
		}
	    return data;
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
	field.input.appendTo(this.elem);
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
