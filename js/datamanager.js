
function DataManager(easyPub) {

    function stripEmptyProperties(properties) {
        for(var key in properties) {
            var next = properties[key];
            if(next==null || next=="" || next=="null") {
                delete properties[key];
            }
        }
    }

    function stripEmptyValues(properties) {
        // If properties is an array check each element to see if it should be deleted and remove,
        // if at the end the array is empty signal calling method to delete empty array.
        if (Object.prototype.toString.call( properties ) === '[object Array]' ) {
            var deletions = [];
            for (var i=0; i<properties.length; i++) {
                var removeValue = stripEmptyValues(properties[i])
                if (removeValue)
                    deletions.unshift(i);
            }

            for (var j=0; j<deletions.length; j++)
                properties.splice(j,1);

            if (properties.length == 0)
                return true;

        }
        // If properties is an object, remove any empty keys, if object then has no keys, singnal
        // calling method to delete empty object.
        else if (Object.prototype.toString.call(properties) === '[object Object]') {
            for(var key in properties) {
                if (stripEmptyValues(properties[key]))
                    delete properties[key];
            }
            if (Object.keys(properties).length == 0) {
                return true;
            }

        }
        // If properties is null or empty (or some special variant), signal calling method to delete.
        else if(properties===null || properties===undefined || properties==="" || properties==="null") {
                return true;

        }

        return false;

    }

    //This needs big cleanup. It's a little hacky right now and kind of defeats the original purpose of the
    //field dictionary
    function makePayload() {
        var fullAuthorsArray = buildFullAuthorsArray();
        var fullAlignmentsArray = buildFullAlignmentsArray();
        var payload = {
            items: [{
                type: ["http://schema.org/CreativeWork"],
                id: easyPub.getID(),
                properties: {
                    name: [easyPub.getValue("title")],
					thumbnailUrl: [easyPub.getValue("thumbnailUrl")],
                    url: [easyPub.getValue("url")],
                    description: [easyPub.getValue("description")],
					typicalAgeRange: [easyPub.getValue("typicalAgeRange")],
                    keywords: easyPub.getValue("keywords"),
            		educationalAlignment:fullAlignmentsArray,
                    dateCreated: [easyPub.getValue("dateCreated")],
                    dateModified: [easyPub.getValue("dateModified")],
                    language: [easyPub.getValue("language")],
                    mediaType: easyPub.getValue("mediaType"), //this is not an actual field in the CreativeWork schema
            		learningResourceType: easyPub.getValue("learningResourceType"),
                    interactivityType: easyPub.getValue("interactivityType"),
                    useRightsUrl: [easyPub.getValue("useRightsUrl")],
					accessRights: [easyPub.getValue("accessRights")],
                    isBasedOnUrl: [easyPub.getValue("isBasedOnUrl")],
                    author: fullAuthorsArray,
                    publisher: [
                        {
                            type: ["http://schema.org/Organization"],
                            properties: {
                                name: [easyPub.getValue("publisher_name")],
                                url:  [easyPub.getValue("publisher_url")],
                                email:  [easyPub.getValue("publisher_email")]

                            }
                        }
                    ],
                    accessibilityFeature: easyPub.getValue("accessibilityFeature"),
                    accessibilityHazard: easyPub.getValue("accessibilityHazard"),
                    accessibilityAPI: easyPub.getValue("accessibilityAPI"),
                    accessibilityControl: easyPub.getValue("accessibilityControl")

                }
            }]
        };
        stripEmptyProperties(payload.items[0].properties);
        stripEmptyProperties(payload.items[0].properties.publisher[0].properties);
        if(_.size(payload.items[0].properties.publisher[0].properties)==0) {
            delete payload.items[0].properties.publisher;
        }
        return payload;
    }

    // Remap data from payload to csv field names
    // Ideally we wouldn't need this because we'd use the same objects and names everywhere
    this.mapPayloadToFields = function (data, index) {
        var fieldData = {}
        for(var key in data) {
			var val = data[key];
            if (key == 'educationalAlignment' || key == 'author' || key == 'publisher') {
                // run through things with mutliple values recursively, making sure the names map correctly
                for (var i=0,l=val.length; i<l; i++) {
                    var properties = val[i].properties;
                    // rename property names
                    if (key == 'educationalAlignment') {
                        // Special case if grade level.
                        if (properties.alignmentType && properties.alignmentType[0]=='educationLevel') {
                            fieldData['grade'] = fieldData['grade'] || [];
                            fieldData['grade'] = fieldData['grade'].concat(properties.targetName);
                            continue;
                        }
                        fieldData['alignmentType_'+properties.alignmentType] = fieldData['alignmentType_'+properties.alignmentType] || [];
                        if (properties.targetName && properties.targetName.length > 0) {
                            fieldData['alignmentType_'+properties.alignmentType]=
                                _.union(fieldData['alignmentType_'+properties.alignmentType], properties.targetName);
                        } else if (properties.targetUrl && properties.targetUrl.length > 0) {
                            fieldData['alignmentType_'+properties.alignmentType] =
                                _.union(fieldData['alignmentType_'+properties.alignmentType], properties.targetUrl);
                        }

                        continue;
                    } else if (key == 'author') {

                        properties = {
                            'author_type':val[i].type[0],
                            'author_name':properties.name,
                            'author_url':properties.url,
                            'author_email':properties.email
                        }
                    } else if (key == 'publisher') {
                        properties = {
                            'publisher_name':properties.name,
                            'publisher_url':properties.url,
                            'publisher_email':properties.email
                        }
                    }
                    var subval = this.mapPayloadToFields(properties, i);
                    for (var field in subval) {
                        fieldData[field] = subval[field];
                    }
                }
            } else {
                // final field values and non-recursive fields
                if (key == 'name') key = 'title';
                if (index != undefined && index > 0) key = key + '_' + (index + 1);
                fieldData[key] = val;
            }
        }
        return fieldData;
    }


    function buildFullAlignmentsArray() {

        var alignmentsArray = easyPub.getAlignments();
        var fullAlignmentsArray = [];
        _.each(easyPub.getValue("grade"), function(gradeLevel, idx, list){

            if(gradeLevel!="") {
                var educationLevelAlignment =
                {
                    type: ["http://schema.org/AlignmentObject"],
                    properties: {
                        alignmentType: ["educationLevel"],
                        educationalFramework: ["US K-12 Grade Levels"],
                        targetName: [gradeLevel]
                    }
                };

                fullAlignmentsArray.push(educationLevelAlignment);
            }

        });


        for(var i=0; i<alignmentsArray.length; i++) {
            var nextFullAlignment = {
                type: ["http://schema.org/AlignmentObject"],
                        // id: "xxx",
                properties: {
                    alignmentType: [alignmentsArray[i].alignmentType],
                    educationalFramework:  [alignmentsArray[i].educationalFramework],
                    targetName: [alignmentsArray[i].targetName],
                    targetUrl:  [alignmentsArray[i].targetUrl]
                }
            }
            stripEmptyProperties(nextFullAlignment.properties);
            if(_.size(nextFullAlignment.properties)>0) {
                fullAlignmentsArray.push(nextFullAlignment);
            }
        }
        return fullAlignmentsArray;
    }

    function buildFullAuthorsArray() {
        var authorsArray = easyPub.getAuthors();
        var fullAuthorsArray = [];
        for(var i=0; i<authorsArray.length; i++) {
            var nextFullAuthor = {
                type: [authorsArray[i]["@type"]],
                properties: {
                    name: [authorsArray[i].name],
                    url:  [authorsArray[i].url],
                    email:  [authorsArray[i].email]
                }
            }
            stripEmptyProperties(nextFullAuthor.properties);
            if(_.size(nextFullAuthor.properties)>0) {
                fullAuthorsArray[i] = nextFullAuthor;
            }
        }
        return fullAuthorsArray;
    }


    this.makeEnvelope = function(useJSON_LD) {
        var payload = makePayload();
        if (useJSON_LD) {
            var jsonldUtil = require("lib/jsonldUtil");
            payload = jsonldUtil.convertToJSONLD(payload);
        }
        var envelope = {
            "doc_type": "resource_data",
            "doc_version": "0.51.0",
            "resource_data_type": "metadata",
            "resource_data": payload,
            "active": true,
            "identity": {
                "submitter_type": "agent",
            },
            "TOS": {
                "submission_TOS": "http://www.learningregistry.org/tos"
            },
            "payload_schema": ["schema.org", "lrmi"],
            "payload_placement": "inline",
            "resource_locator": easyPub.getValue("url"),
            "keys": ["EZPublish-1.5","EZPublish"]
        }
        if (useJSON_LD) {}
            envelope["payload_schema"].push("JSON-LD");

        stripEmptyValues(envelope);
        return envelope;
    }

    this.makeAllEnvelopes = function(useJSON_LD) {
        var envelopes = [];
        var numRows = easyPub.getNumImportRows();
        if(numRows==0) {
            envelopes.push(this.makeEnvelope(useJSON_LD));
        } else {
            for(var i=0; i<numRows; i++) {
                easyPub.setCurrentImportData(i);
                var envelope = this.makeEnvelope(useJSON_LD);
                envelopes.push(envelope);
            }
        }
        return envelopes;
    }

    this.testEnvelope = function() {
        var envelope = this.makeEnvelope();
        console.log(envelope);
    }

    this.downloadData = function(type) {
        var output;
        var filetype;
        if (type == "json") {
            var data = this.makeEnvelope();
            output = JSON.stringify(data);
            filetype = 'text/json';
        } else if (type == "csv") {
            var data = easyPub.getData(true);
            output = toCSV(data);
            filetype = 'text/csv';
        }
        //document.location = 'data:Application/octet-stream,' +
        //                         encodeURIComponent(output);

        window.URL = window.webkitURL || window.URL;
        blob = new Blob([output], {
            type: filetype
        });
        url = window.URL.createObjectURL(blob);
        // document.location = url;
        window.open(url, "blobwin")
    }


    this.toCSV = function(data) {
        console.log("toCSV");
        var csv = "";
        var row2 = ""
        for (key in data) {
            csv += key + ", ";
            row2 += data[key] + ", ";
            console.log(key, data[key])
        }
        csv += "\r\n" + row2;
        return csv;
    }

    this.twoDArrayToObjectArray = function(arrData, fieldManager) {

        //console.log("remapDictionary:");
        //console.log(remapDictionary);
        var objArray = {},
            remapDictionary = fieldManager.englishNameDictionary,
            fieldDictionary = fieldManager.fieldDictionary;
        var indexTest = /(.*...+) (\d+)$/;
        objArray.numRows = arrData.length-1;
        for(var colIndex=0; colIndex<arrData[0].length; colIndex++) {
            var fieldName = arrData[0][colIndex];
            var fieldKey = remapDictionary[fieldName],
                fieldBaseKey = fieldKey;
            //if we haven't found a field key, it might be an indexed name
            if(!fieldKey) {
                var match = indexTest.exec(fieldName);
                if(match) {
                    var base = match[1];
                    var index = match[2];
                    if(base && index && remapDictionary[base]) {
                        fieldKey = remapDictionary[base] + "_" + index;
                        fieldBaseKey = remapDictionary[base];
                    } else {
                        console.log("can't remap, got base: " + base + ", index: " + index);
                        continue;
                    }
                } else {
                    console.log("field not found: " + fieldName);
                }
            }

           console.log("remapping: " + fieldName + " to: " + fieldKey);
            var colData = [];

            for(var rowIndex=1; rowIndex<arrData.length; rowIndex++) {

            if (typeof fieldName != 'undefined') {

            if (fieldName == "Author Type" || fieldName == "Author Type 2") {
                console.log(fieldName + " before is " + arrData[rowIndex][colIndex]);
                if (arrData[rowIndex][colIndex] == "Person" ||  arrData[rowIndex][colIndex] == "person" || arrData[rowIndex][colIndex] == "PERSON") {
                    arrData[rowIndex][colIndex] = "http://schema.org/Person";
                } else if (arrData[rowIndex][colIndex] == "Organization" ||  arrData[rowIndex][colIndex] == "organization" || arrData[rowIndex][colIndex] == "ORGANIZATION") {
                    arrData[rowIndex][colIndex] = "http://schema.org/Organization";
                }
                console.log(fieldName + " after is " + arrData[rowIndex][colIndex]);
            }

            if (fieldName == 'Access Rights URL') {
                console.log(fieldName + " before is " + arrData[rowIndex][colIndex]);
                accessVal = arrData[rowIndex][colIndex].replace(/\s+/g, '').toLowerCase();;
                console.log(fieldName + " after normalized is " + accessVal);

                if (arrData[rowIndex][colIndex] == "Free Access" || arrData[rowIndex][colIndex] == "FreeAccess" || arrData[rowIndex][colIndex] == "free access" || arrData[rowIndex][colIndex] == "freeaccess") {

                    arrData[rowIndex][colIndex] = "https://ceds.ed.gov/element/001561#FreeAccess";

                } else if (arrData[rowIndex][colIndex] == "Free Access with Registration" || arrData[rowIndex][colIndex] == "FreeAccesswithRegistration" || arrData[rowIndex][colIndex] == "free access with registration" || arrData[rowIndex][colIndex] == "freeaccesswithregistration") {

                    arrData[rowIndex][colIndex] = "https://ceds.ed.gov/element/001561#FreeAccessWithRegistration";

                } else if (arrData[rowIndex][colIndex] == "Limited Free Access" || arrData[rowIndex][colIndex] == "LimitedFreeAccess" || arrData[rowIndex][colIndex] == "limited free access" || arrData[rowIndex][colIndex] == "limitedfreeaccess") {

                    arrData[rowIndex][colIndex] = "https://ceds.ed.gov/element/001561#LimitedFreeAccess";

                } else if (arrData[rowIndex][colIndex] == "Available for Purchase" || arrData[rowIndex][colIndex] == "AvailableforPurchase" || arrData[rowIndex][colIndex] == "available for purchase" || arrData[rowIndex][colIndex] == "availableforpurchase") {

                    arrData[rowIndex][colIndex] = "https://ceds.ed.gov/element/001561#AvailableForPurchase";

                } else if (arrData[rowIndex][colIndex] == "Available by Subscription" || arrData[rowIndex][colIndex] == "AvailablebySubscription" || arrData[rowIndex][colIndex] == "available by subscription" || arrData[rowIndex][colIndex] == "availablebysubscription") {

                    arrData[rowIndex][colIndex] = "https://ceds.ed.gov/element/001561#AvailableBySubscription";

                }
                console.log(fieldName + " after replacing is " + arrData[rowIndex][colIndex]);
            }
            if (fieldName == 'Date Created'|| fieldName == 'Date Modified') {

                // Pulls the current year to determine 20/21c
                var year = new Date().getFullYear();
                // We only want the last two digits to compare to Excel's data
                year = year.toString().substr(2,2);

                // Converts val to a string so that we can evaluate it with RegExp
                var excelTest = arrData[rowIndex][colIndex];

                // Tests for the default Excel formatting when the year only has two digits.
                var excelRegex = new RegExp(/^([1-9]|1[0-2])\/([1-9]|1\d|2\d|3[01])\/\d{2}$/);
                var excelRegexTwo = new RegExp(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{2}$/);

                // Test for the default Excel formatting when the year has 4 digits.
                var excelRegexThree = new RegExp(/^([1-9]|1[0-2])\/([1-9]|1\d|2\d|3[01])\/\d{4}$/);
                var excelRegexFour = new RegExp(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/);

                // Matches regular expressions for dates with 2 digit years
                var excelMatch = excelTest.match(excelRegex);
                var excelMatchTwo = excelTest.match(excelRegexTwo);

                // Matches Regular expressions for dates with 4 digit years
                var excelMatchThree = excelTest.match(excelRegexThree);
                var excelMatchFour = excelTest.match(excelRegexFour);

                // We will need to convert the strings over depending on whether or not they have a 0 in the month / day
                var convertedYear = "",
                    convertedMonth = "",
                    convertedDay = ""
                    convertedDate = "";

                // If data matches Excel's default formatting with two digit years
                if (excelMatch != null || excelMatchTwo != null) {
                    var splitString = excelTest.split("/");

                    //Convert year from ## to ####
                    if (splitString[2] > year) {
                        convertedYear = "19" + splitString[2];
                    } else {
                        convertedYear = "20" + splitString[2];
                    }

                    //Convert day < 10 to 0# format
                    if (splitString[1] < 10 && splitString[1].length < 2) {
                        convertedDay = "0" + splitString[1];
                    } else {
                         convertedDay = splitString[1];
                    }

                    //Convert month < 10 to 0# format
                     if (splitString[0] < 10 && splitString[0].length < 2) {
                        convertedMonth = "0" + splitString[0];
                    } else {
                        convertedMonth = splitString[0];
                    }
                    //Put the proper format together and submit
                    convertedDate = convertedYear + "-" + convertedMonth + "-" + convertedDay;
                    //field.value(convertedDate);
                    arrData[rowIndex][colIndex] = convertedDate;

                    // If data matches Excel's default formatting with four digit years
                    } else if (excelMatchThree != null || excelMatchFour != null) {

                        var splitString = excelTest.split("/");

                        //Convert day < 10 to 0# format
                        if (splitString[1] < 10 && splitString[1].length < 2) {
                            convertedDay = "0" + splitString[1];
                        } else {
                            convertedDay = splitString[1];
                        }

                         //Convert month < 10 to 0# format
                        if (splitString[0] < 10 && splitString[0].length < 2) {
                            convertedMonth = "0" + splitString[0];
                        } else {
                            convertedMonth = splitString[0];
                        }
                        //Put the proper format together and submit
                        convertedDate = splitString[2] + "-" + convertedMonth + "-" + convertedDay;

                        //field.value(convertedDate);
                        arrData[rowIndex][colIndex] = convertedDate;
                    }
                }
            }
                colData[rowIndex-1] = arrData[rowIndex][colIndex];

                // handle wonky cells that could contain another dimension.
            if (fieldDictionary[fieldBaseKey] && !!fieldDictionary[fieldBaseKey].csvParser) {
                    colData[rowIndex-1] = fieldDictionary[fieldBaseKey].csvParser(colData[rowIndex-1]);
                }

            }

            objArray[fieldKey] = colData;
        }
        return objArray;
    }

    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.

    /* replaced this with lib/csvToArray
    this.CSVToArray = function(strData, strDelimiter) {
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
        "([^\"\\" + strDelimiter + "\\r\\n]*))"),
            "gi");


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [
            []
        ];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
            strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                    "\"");

            } else {
                // We found a non-quoted value.
                var strMatchedValue = arrMatches[3];
            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(trim1(strMatchedValue));
        }

        // Return the parsed data.
        return (arrData);
    }
    */

    function trim1(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}
