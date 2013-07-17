function DataManager(easyPub) {

    var nodeURL = "http://sandbox.learningregistry.org";

    var service = "publish";

    var succTempSrc = document.getElementById("successDialogTemplate").innerHTML;
    successDialogTemplate = Handlebars.compile(succTempSrc);
    var failTempSrc = document.getElementById("failDialogTemplate").innerHTML;
    failDialogTemplate = Handlebars.compile(failTempSrc);

    /*var default_oauth_data = {
        consumer_key: 'john.brecht@sri.com',
        consumer_secret: 'ATjaQAYRMhK0e7gppFBK2pZTtPzaBRFD',
        token: 'node_sign_token',
        token_secret: '7Hy6hsuz702wfuepQpfOgfP3WUCGunGF',
        node_url: nodeURL
    }*/

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
                    url: [easyPub.getValue("url")],
                    description: [easyPub.getValue("description")],
                    keywords: [easyPub.getValue("keywords")],
            		educationalAlignment:fullAlignmentsArray,
                    dateCreated: [easyPub.getValue("dateCreated")],
                    dateModified: [easyPub.getValue("dateModified")],
                    language: [easyPub.getValue("language")],
                    mediaType: [easyPub.getValue("mediaType")], //this is not an actual field in the CreativeWork schema
            		learningResourceType: [easyPub.getValue("learningResourceType")],
                    interactivityType: [easyPub.getValue("interactivityType")],
                    useRightsUrl: [easyPub.getValue("useRightsUrl")],
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


    function buildFullAlignmentsArray() {

        var alignmentsArray = easyPub.getAlignments();
        var fullAlignmentsArray = [];

        var educationLevelAlignment = 
            {
                type: ["http://schema.org/AlignmentObject"],
                // id: "xxx",
                properties: {
                    alignmentType: ["educationLevel"],
                    educationalFramework: ["US K-12 Grade Levels"],
                    targetName: [easyPub.getValue("grade")],
                    targetDescription: [easyPub.getValue("k12Grade")],
                }
            };
        if(easyPub.getValue("grade")!=="" || easyPub.getValue("k12Grade")!=="") {
            fullAlignmentsArray.push(educationLevelAlignment);
        }

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
                type: ["http://schema.org/Person"],
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

    function makeEnvelope() {
        var payload = makePayload();
        var envelope = {
            "doc_type": "resource_data",
            "doc_version": "0.49.0",
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
            "resource_locator": easyPub.getValue("url")
        }
        stripEmptyValues(envelope);
        return envelope;
    }

    function makeAllEnvelopes() {
        var envelopes = [];
        var numRows = easyPub.getNumImportRows();
        if(numRows==0) {
            envelopes.push(makeEnvelope());
        } else { 
            for(var i=0; i<numRows; i++) {
                easyPub.setCurrentImportData(i);
                var envelope = makeEnvelope();
                envelopes.push(envelope);
            }
        }
        return envelopes;
    }

    this.testEnvelope = function() {
        var envelope = makeEnvelope();
        console.log(envelope);
    }

    //TODO - handle arrays of form data
    this.submitData = function () {
        envelopes = makeAllEnvelopes();

        var oauth_data = easyPub.getOAuthData();
        if(oauth_data==null) {
            console.log("null oauth_data, aborting submit")
            return;
        } else {
            req_info = getOAuthInfo(oauth_data);
            req_info.message.body = {
                documents: envelopes
            };
            console.log("req_info:");
            console.log(req_info);
            request = oauthRequest(oauth_data.node_url + '/publish', req_info.message, req_info.accessor);
            
            request.done(function(msg) {
                console.log("Done");
                console.log(msg);
                if(msg.OK) {
                    alert("Submission succeeded, press OK to view the node reply.");
                    //easyPub.submissionComplete(true);
                    displayResults(msg.document_results);
                } else {
                    alert("Submission failed, press OK to view the node reply.");
                    displayResults(msg.document_results);
                    //easyPub.submissionComplete(false);
                }
                
                /*
                var results = msg.document_results;
                for(key in results) {
                    var nextResult = results[key];
                    console.log("nextResult: ");
                    console.log(nextResult);
                    var OK = nextResult.OK;
                    if(OK) {
                        console.log("success, doc_ID: " + nextResult.doc_ID);
                        var tempData = {
                            guid:nextResult.doc_ID,
                            name:easyPub.getValue("title"),
                            serverURL: nodeURL,
                            docID:nextResult.doc_ID
                        };
                        successDialogHtml = successDialogTemplate(tempData);
                        $("body").append(successDialogHtml);
                        $("#"+nextResult.doc_ID).dialog({position:{my: "top", at: "top", of: $("#middleCol")}});
                        easyPub.submissionComplete(true);
                    } else {
                        console.log("error: " + nextResult.error);
                        var tempData = {
                            guid:easyPub.getValue("title"),
                            error:nextResult.error,
                            name:formData.Name
                        };
                        failDialogHtml = failDialogTemplate(tempData);
                        $("body").append(failDialogHtml);
                        $("#"+formData.Name).dialog({position:{my: "top", at: "top", of: $("#middleCol")}});
                        easyPub.submissionComplete(false);
                    }
                }*/
            });
            request.fail(function(msg) {
                console.log("Fail");
                console.log(msg);
                alert("Submission failed.");
                easyPub.submissionComplete(false);
            });
        }

    }

    function getOAuthInfo(oauth_data) {

        var message = {
            parameters: {}
        };
        var accessor = {
            consumerKey: oauth_data.consumer_key,
            consumerSecret: oauth_data.consumer_secret,
            token: oauth_data.token,
            tokenSecret: oauth_data.token_secret
        };

        return {
            message: message,
            accessor: accessor
        };
    }

    function oauthRequest(path, message, accessor, undefined) {
        message.action = path;
        message.method = 'POST';
        OAuth.completeRequest(message, accessor);
        var parameters = message.parameters;
        var options = {
            headers: {
                Authorization: OAuth.getAuthorizationHeader('', parameters)
            },
            data: JSON.stringify(message.body)
        }

        // var options = {
        //     contentType: "application/x-www-form-urlencoded",
        //     headers: {
        //         Authorization: OAuth.getAuthorizationHeader('', parameters),
        //         Accept: "application/json"
        //     },
        //     data: OAuth.formEncode(parameters)
        // }

        return commonAjax('POST', path, options);
    }

    function commonAjax(method, url, options) {
        var settings = {
            type: method,
            contentType: "application/json",
            dataType: "json"
        }
        if (options) {
            settings = _.extend(settings, options);
        }
        var request = $.ajax(url, settings);

        return request;
    }

    function displayResults(results) {
        var output = JSON.stringify(results);
        var filetype = 'text/json';
        window.URL = window.webkitURL || window.URL;
        blob = new Blob([output], {
            type: filetype
        });
        url = window.URL.createObjectURL(blob);
        // document.location = url;
        displayDialog(url);
    }


    function displayDialog(url) {
        $('#resultsDialog > iframe').attr("src", url);
        $('#resultsDialog').dialog("open");
    }

    this.downloadData = function(type) {
        var output;
        var filetype;
        if (type == "json") {
            var data = makeEnvelope();
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


    function toCSV(data) {
        console.log("toCSV");
        console.log(data);
        var csv = "";
        var row2 = ""
        for (key in data) {
            csv += key + ", ";
            row2 += data[key] + ", ";
            console.log(key, data[key])
        }
        csv += "\n" + row2;
        return csv;
    }

    this.twoDArrayToObjectArray = function(arrData, remapDictionary) {
        //console.log("remapDictionary:");
        //console.log(remapDictionary);
        var objArray = {};
        var indexTest = /(.*...+) (\d+)$/;
        objArray.numRows = arrData.length-1;
        for(var colIndex=0; colIndex<arrData[0].length; colIndex++) {
            var fieldName = arrData[0][colIndex];
            var fieldKey = remapDictionary[fieldName];
            //if we haven't found a field key, it might be an indexed name
            if(!fieldKey) {
                var match = indexTest.exec(fieldName);
                if(match) {
                    var base = match[1];
                    var index = match[2];
                    if(base && index && remapDictionary[base]) {
                        fieldKey = remapDictionary[base] + "_" + index;
                    } else {
                        console.log("can't remap, got base: " + base + ", index: " + index);
                        continue;
                    }
                } else {
                    console.log("field not found: " + fieldName);
                }
            }
           // console.log("remapping: " + fieldName + " to: " + fieldKey);
            var colData = [];
            for(var rowIndex=1; rowIndex<arrData.length; rowIndex++) {
                colData[rowIndex-1] = arrData[rowIndex][colIndex];
            }
            objArray[fieldKey] = colData;
        }
        return objArray;
    }

    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.

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

    function trim1(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
}