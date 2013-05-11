function DataManager(easyPub) {

    var succTempSrc = document.getElementById("successDialogTemplate").innerHTML;
    successDialogTemplate = Handlebars.compile(succTempSrc);
    var failTempSrc = document.getElementById("failDialogTemplate").innerHTML;
    failDialogTemplate = Handlebars.compile(failTempSrc);
    var nodeURL = "http://sandbox.learningregistry.org";

    var service = "publish";

    /*var default_oauth_data = {
        consumer_key: 'john.brecht@sri.com',
        consumer_secret: 'ATjaQAYRMhK0e7gppFBK2pZTtPzaBRFD',
        token: 'node_sign_token',
        token_secret: '7Hy6hsuz702wfuepQpfOgfP3WUCGunGF',
        node_url: nodeURL
    }*/

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

        return payload;
    }


    function buildFullAlignmentsArray() {

        var alignmentsArray = easyPub.getAlignments();
        var fullAlignmentsArray = [];

        var educationLevelAlignment = 
            {
                type: ["http://schema.org/AlignmentObject"],
                id: "xxx",
                properties: {
                    alignmentType: ["educationLevel"],
                    educationalFramework: ["US K-12 Grade Levels"],
                    targetName: [easyPub.getValue("grade")],
                    targetDescription: [easyPub.getValue("k12Grade")],
                }
            };
        fullAlignmentsArray.push(educationLevelAlignment);

        for(var i=0; i<alignmentsArray.length; i++) {
            console.log("parsing Alignment " + i)
            var nextFullAlignment = {
                type: ["http://schema.org/AlignmentObject"],
                        id: "xxx",
                properties: {
                    alignmentType: [alignmentsArray[i].alignmentType],
                    educationalFramework:  [alignmentsArray[i].educationalFramework],
                    targetName: ["Standards Alignment"],
                    targetUrl:  [alignmentsArray[i].targetUrl]
                }
            }
            fullAlignmentsArray.push(nextFullAlignment);
        }
        return fullAlignmentsArray;
    }

    function buildFullAuthorsArray() {
        var authorsArray = easyPub.getAuthors();
        var fullAuthorsArray = [];
        for(var i=0; i<authorsArray.length; i++) {
            console.log("parsing author " + i)
            var nextFullAuthor = {
                type: ["http://schema.org/Person"],
                properties: {
                    name: [authorsArray[i].name],
                    url:  [authorsArray[i].url],
                    email:  [authorsArray[i].email]
                }
            }
            fullAuthorsArray[i] = nextFullAuthor;
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
        return envelope;
    }

    this.testEnvelope = function() {
        var envelope = makeEnvelope();
        console.log(envelope);
    }

    //TODO - handle arrays of form data
    this.submitData = function () {
        envelope = makeEnvelope()
        var oauth_data = easyPub.getOAuthData();
        if(oauth_data==null) {
            console.log("null oauth_data, aborting submit")
            return;
        } else {
            req_info = getOAuthInfo(oauth_data);
            req_info.message.body = {
                documents: [envelope]
            };
            request = oauthRequest(oauth_data.node_url + '/publish', req_info.message, req_info.accessor);
            
            request.done(function(msg) {
                console.log("Done");
                console.log(msg);
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
                        easyPub.submissionSuccessful();
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
                    }
                }
            });
            request.fail(function(msg) {
                console.log("Fail");
                console.log(msg);
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

    this.downloadData = function(type) {
        var output;
        var filetype;
        if (type == "json") {
            var data = makeEnvelope();
            output = JSON.stringify(data);
            filetype = 'text/json';
        } else if (type == "csv") {
            var data = easyPub.getData();
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
        document.location = url;
    }


    function toCSV(data) {
        var csv = "";
        var row2 = ""
        for (key in data) {
            csv += key + ", ";
            row2 += data[key] + ", ";
        }
        csv += "\n" + row2;
        return csv;
    }

    this.twoDArrayToObjectArray = function(arrData) {
        var objArray = {};
        objArray.numRows = arrData.length-1;
        for(var colIndex=0; colIndex<arrData[0].length; colIndex++) {
            var fieldName = arrData[0][colIndex];
            var colData = [];
            for(var rowIndex=1; rowIndex<arrData.length; rowIndex++) {
                colData[rowIndex-1] = arrData[rowIndex][colIndex];
            }
            objArray[fieldName] = colData;
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