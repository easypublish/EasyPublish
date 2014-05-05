(function(){

    function val(blob) {
        if (!_.isObject(blob) && !_.isArray(blob)) {
            return blob;
        }
        else if (_.isArray(blob) && blob.length == 1){
            return val(blob[0]);
        } else if (_.isArray(blob) && blob.length > 1) {
            var val_list = _.map(blob, function(item){
                return val(item);
            });
            return val_list;
        } else if (_.isObject(blob)) {
            return processHTMLMicrodataClassToJSONLD(blob);
        } else {
            return null;
        }
    }



    var vocab_schema = "http://schema.org/",
        jsonld_template = {
            "@context": [
                {
                    "@vocab": vocab_schema,
                    "url": { "@type": "@id" }
                },
                {
                    "lrmi": "http://lrmi.net/the-specification#",
                    "useRightsUrl": {"@id": "lrmi:useRightsUrl", "@type": "@id"}
                }
            ]
        };

    function processHTMLMicrodataClassToJSONLD(classObj) {

        var jsonldObj = {};

        if (!!classObj.id) {
            jsonldObj["@id"] = val(classObj.id);
        }

        if (!!classObj.type) {
            var type = val(classObj.type);
            jsonldObj["@type"] = type.slice(vocab_schema.length);
        }

        if (!!classObj.properties) {
            _.map(classObj.properties, function(value, key, obj) {
                this[key] = val(value);
            }, jsonldObj);
        }

        return jsonldObj


    }

    function processPropsFromJSONLDToHTMLMicrodata(propVal) {
        var md_val;
        if (_.isArray(propVal)) {
            md_val = _.map(propVal, function(item, idx, list) {
                return processPropsFromJSONLDToHTMLMicrodata(item);
            });
        } else if (_.isObject(propVal)) {
            md_val = processJSONLDToHTMLMicrodataClass(propVal);
        } else {
            md_val = propVal;
        }
        return md_val;
    }

    function processJSONLDToHTMLMicrodataClass(classObj) {
        var microdataObj = {};
        _.map(classObj, function(value, key, obj) {
            if ("@type" === key) {
                this.type = [vocab_schema+value];
            } else if ("@id" === key) {
                this.id = value;
            } else if ("@context" === key) {
                // skip
            } else {
                this.properties = this.properties || {};
                var conv_val = processPropsFromJSONLDToHTMLMicrodata(value);
                this.properties[key] = _.isArray(conv_val) ? conv_val : [conv_val];
            }
        }, microdataObj);
        return microdataObj;
    }


    function convertToJSONLD(payload) {
        var converted = {};
        if (_.isArray(payload.items) && payload.items.length == 1) {
            converted = processHTMLMicrodataClassToJSONLD(payload.items[0]);
        }

        return _.extend(converted, jsonld_template);
    }

    function convertFromJSONLD(payload) {
        // convert resource_data to object if it is a string
        if(_.isString(payload)) {
            try {
                payload = JSON.parse(payload)
            }
            catch(ex) {
                console.log("Failed to parse resource_data (expecting JSON): "+payload);
            }
        }

        var converted = {
            "items":[ processJSONLDToHTMLMicrodataClass(payload) ]
        };
        return converted;
    }


    function getResourceDataAsMicrodata(envelope) {
        if (envelope.resource_data && _.isArray(envelope.payload_schema) && _.indexOf(envelope.payload_schema, "JSON-LD") > -1) {
            return convertFromJSONLD(envelope.resource_data);
        } else {
            return envelope.resource_data;
        }

    };

    exports.convertToJSONLD = convertToJSONLD;
    exports.convertFromJSONLD = convertFromJSONLD;
    exports.getResourceDataAsMicrodata = getResourceDataAsMicrodata;

})();
