$(function() { 
	var easyPub = new EasyPublish();
});

EasyPublish.prototype.constructor = EasyPublish;
function EasyPublish() {

	var editors = {};

	var fieldManager = new FieldManager();
	var dnd = new DragAndDrop(this);

	function buildForm(name, fields) {
		//var form = $("#"+name+"Form");
		var formTableBody = $("#"+name+"FormTableBody");

		for(key in fields) {
			var nextField = fields[key];
			var nextRow = new FieldEditorRow(nextField);
			nextRow.elem.appendTo(formTableBody);	
			//have to construct combo boxes after they've been added to DOM
			if(nextField.type==Field.CHOICE) {
				$("#"+nextField.id).autocombobox();
			}
		}
	}
	buildForm("main", fieldManager.mainFields);
	buildForm("alignment", fieldManager.alignmentFields);
	buildForm("author", fieldManager.authorFields);
	buildForm("publisher", fieldManager.publisherFields);

	var submitButton = $("#Submit");
	submitButton.button();
	submitButton.click(function() {
		var valid = validateForm();
		if(valid) {
			submitData();
		} else {
			alert("Please correct the indicated problems");
		}

	});	
	var downloadJSONButton = $("#DownloadJSON");
	downloadJSONButton.button();
	downloadJSONButton.click(function() {
		var valid = validateForm();
		if(valid) {
			downloadData("json");
		} else {
			alert("Please correct the indicated problems");
		}
	});

	var downloadCSVButton = $("#DownloadCSV");
	downloadCSVButton.button();
	downloadCSVButton.click(function() {
		var valid = validateForm();
		if(valid) {
			downloadData("csv");
		} else {
			alert("Please correct the indicated problems");
		}
	});

	var testDataButton = $("#TestData");
	testDataButton.button();
	testDataButton.click(function() {
		console.log("TestData clicked")
		for(key in fieldManager.fieldDictionary) {
			var field = fieldManager.fieldDictionary[key];
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

	$( document ).tooltip({ position: { my: "left top", at: "right+15 top", collision: "flipfit" } });

	function getData() {
		var data = {};
		for(key in fieldManager.fieldDictionary) {
			var field = fieldManager.fieldDictionary[key];
			data[field.objectName] = field.value();
		}
	    //console.log("data:");
	    //console.log(JSON.stringify(data));
	    return data;
	}

	function submitData() {
		var data = getData();
	}

	function downloadData(type) {
		var data = getData();
		var output;
		var filetype;
		if(type=="json") {
			output = JSON.stringify(data);
			filetype = 'text/json';
		} else if(type=="csv") {
			output = toCSV(data);
			filetype = 'text/csv';
		}
		//document.location = 'data:Application/octet-stream,' +
		//                         encodeURIComponent(output);

		window.URL = window.webkitURL || window.URL;
		blob = new Blob([output], {type: filetype});
		url = window.URL.createObjectURL(blob);
		document.location = url;
	}


	function toCSV(data) {
		var csv = "";
		var row2 = ""
		for(key in data) {
			csv += key +", ";
			row2 += data[key] + ", ";
		}
		csv += "\n"+row2;
		return csv;
	}

	this.importCSVData = function(dataText) {
		var arrData = CSVToArray(dataText);		
		for(var i=0; i<arrData[0].length; i++) {
			var fieldName = trim1(arrData[0][i]);
			console.log("imprting field: " + fieldName);
			var field = fieldManager.fieldDictionary[fieldName];
			if(field) {
				field.value(trim1(arrData[1][i]));
			}
		}
	}
	function trim1 (str) {
	    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}

	// This is the validation function:
	function validateForm() {

	    // Start validation:
	    $.validity.start();
	    
	    // Validator methods go here:
	    function validateFields(fields) {
			for(key in fields) {
				var nextField = fields[key];
				//console.log("validating: " + nextField.name);
				nextField.validateField();
				//nextField.input.require();
		    }
		}
		validateFields(fieldManager.mainFields);
		validateFields(fieldManager.alignmentFields);
		validateFields(fieldManager.authorFields);
		validateFields(fieldManager.publisherFields);
	    
	    // All of the validator methods have been called:
	    // End the validation session:
	    var result = $.validity.end();
	    
	    console.log("validity result: ");
	    console.log(result);
	    // Return whether it's okay to proceed with the Ajax:
	    return result.valid;
	}


    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
    	// Check to see if the delimiter is defined. If not,
    	// then default to comma.
    	strDelimiter = (strDelimiter || ",");

    	// Create a regular expression to parse the CSV values.
    	var objPattern = new RegExp(
    		(
    			// Delimiters.
    			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

    			// Quoted fields.
    			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

    			// Standard fields.
    			"([^\"\\" + strDelimiter + "\\r\\n]*))"
    		),
    		"gi"
    		);


    	// Create an array to hold our data. Give the array
    	// a default empty first row.
    	var arrData = [[]];

    	// Create an array to hold our individual pattern
    	// matching groups.
    	var arrMatches = null;


    	// Keep looping over the regular expression matches
    	// until we can no longer find a match.
    	while (arrMatches = objPattern.exec( strData )){

    		// Get the delimiter that was found.
    		var strMatchedDelimiter = arrMatches[ 1 ];

    		// Check to see if the given delimiter has a length
    		// (is not the start of string) and if it matches
    		// field delimiter. If id does not, then we know
    		// that this delimiter is a row delimiter.
    		if (
    			strMatchedDelimiter.length &&
    			(strMatchedDelimiter != strDelimiter)
    			){

    			// Since we have reached a new row of data,
    			// add an empty row to our data array.
    			arrData.push( [] );

    		}


    		// Now that we have our delimiter out of the way,
    		// let's check to see which kind of value we
    		// captured (quoted or unquoted).
    		if (arrMatches[ 2 ]){

    			// We found a quoted value. When we capture
    			// this value, unescape any double quotes.
    			var strMatchedValue = arrMatches[ 2 ].replace(
    				new RegExp( "\"\"", "g" ),
    				"\""
    				);

    		} else {

    			// We found a non-quoted value.
    			var strMatchedValue = arrMatches[ 3 ];

    		}


    		// Now that we have our value string, let's add
    		// it to the data array.
    		arrData[ arrData.length - 1 ].push( strMatchedValue );
    	}

    	// Return the parsed data.
    	return( arrData );
    }


}



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

}
