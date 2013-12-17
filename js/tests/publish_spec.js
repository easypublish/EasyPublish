var customMatcher = function(schemaList) {
    return {
        toValidateAgainstSchema: function(util, customEqualityTesters) {
            var JSV = require("lib/jsv/jsv").JSV,
                env = JSV.createEnvironment();
            
            // add all the known schemas to the environment
            _.each(schemaList, function(schema){
                // schema.data = this.environment.createSchema(schema.data, undefined, schema.$ref);
                schema.data = this.environment.createSchema(schema.data);
            }, {environment:env});

            return {
                compare: function(model, schemaOrUri) {
                    var schema = schemaOrUri;
                    if (_.isString(schemaOrUri)) {
                        var schemaObj = env.findSchema(schema);
                        if (schemaObj) {
                            schema = schemaObj;
                        } else {
                            return {
                                pass: false,
                                message: "Expected "+schemaOrUri+" to be an URI for a loaded schema"
                            };
                        }
                    }

                    var report = env.validate(model, schema),
                        result = { pass: report.errors.length === 0 };

                    if (result.pass) {
                        result.message = "Expected "+JSON.stringify(model)+" to not validate against schema "+JSON.stringify(schemaOrUri);
                    } else {
                        result.message = "Expected "+JSON.stringify(model)+" to validate against schema "+
                            JSON.stringify(schemaOrUri)+" for the following reasons: "+
                            JSON.stringify(report.errors);
                    }
                    return result;
                }
            }
        }
    };
};


describe("Schema Validation", function(){

    function findRefs() {}

    function parseRef(url) {
        return url.replace(/^js\//, "file:lr\/");
    }

    function parseUrl($ref) {
        return $ref.replace(/^file:lr/, "js");
    }

    var started = {},
        refMap = {},
        completed = {};


    function process(ctx) {
        return function (data, textStatus, jqXHR) {
            // console.log(data);
            // console.log(textStatus);
            // console.log(jqXHR);
            
            // JSV uses a newer URL for Draft 3.
            if (data.$schema === "http://tools.ietf.org/html/draft-zyp-json-schema-03") {
                data.$schema = "http://json-schema.org/draft-03/schema#";
            }

            // Remove any extends, JSV doesn't know how to handle it right.
            if (data.extends) {
                delete data.extends;
            }

            var $ref = parseRef(ctx.url);
            
            // give the schema an ID.
            data.id = $ref;

            refMap[$ref] = completed[ctx.url] = {
                url: ctx.url,
                $ref: $ref,
                schema: data
            };
            done(ctx.callback);
        }
    }


    function done(callback) {
        if (_.keys(completed).length == _.keys(started).length) {
            callback(completed);
        }  
    }

    function loadSchemas(schemaList, cb) {
        started = {};
        completed = {};
        for (var idx in schemaList) {
            var schema = schemaList[idx];
            load(schema.url, cb);
        }
    }

    function load(url, cb) {
        started[url]=true;
        
        if (completed[url] != undefined || _.keys(started).length > 30)
            return;

        $.getJSON(url, process({callback:cb,url:url}))
                .fail(function( jqxhr, settings, exception ) {
                    console.log(jqxhr);
                    console.log(exception);
                    completed[this.url] = false;
                    completed.push(this.url);

                    done(cb);
                });
    }

    var listOfallSchemas = [
        { 
            url: "js/schema/any/resource_data.json",
            ref: "file:lr/schema/any/resource_data.json#"
        },
        { 
            url: "js/schema/v_0_23/resource_data.json",
            ref: "file:lr/schema/v_0_23/resource_data.json#"
        },
        { 
            url: "js/schema/v_0_23/inline_resource_data.json",
            ref: "file:lr/schema/v_0_23/inline_resource_data.json#"
        },
        { 
            url: "js/schema/v_0_23/linked_resource_data.json",
            ref: "file:lr/schema/v_0_23/linked_resource_data.json#"
        },
        { 
            url: "js/schema/v_0_49/resource_data.json",
            ref: "file:lr/schema/v_0_49/resource_data.json#"
        },
        { 
            url: "js/schema/v_0_49/inline_resource_data.json",
            ref: "file:lr/schema/v_0_49/inline_resource_data.json#"
        },
        { 
            url: "js/schema/v_0_49/linked_resource_data.json",
            ref: "file:lr/schema/v_0_49/linked_resource_data.json#"
        },
        { 
            url: "js/schema/v_0_49/deleted_resource_data.json",
            ref: "file:lr/schema/v_0_49/deleted_resource_data.json#"
        },
        { 
            url: "js/schema/v_0_49/tombstone.json",
            ref: "file:lr/schema/v_0_49/tombstone.json#"
        },
        { 
            url: "js/schema/abstract_resource_data.json",
            ref: "file:lr/schema/abstract_resource_data.json#"
        },
        { 
            url: "js/schema/abstract_inline_resource_data.json",
            ref: "file:lr/schema/abstract_inline_resource_data.json#"
        },
        { 
            url: "js/schema/abstract_linked_resource_data.json",
            ref: "file:lr/schema/abstract_linked_resource_data.json#"
        }

    ];

       
    var allSchemas = undefined;

    beforeEach(function(done){
        allSchemas = undefined;

        loadSchemas(listOfallSchemas, foundAllSchemas);          
    
        function foundAllSchemas(found) {
            console.log("Found!!");
            console.log(found);
            
            allSchemas = found;

            jasmine.addMatchers(customMatcher(found));
            done();
        } 

    });

    it("should validate this simple schema", function(){
        var json = {};
        var schema = {"type":"object"};

        expect(json).toValidateAgainstSchema(schema);
    });


    it("should validate a delete ", function(){
        var json = {
            replaces: [ "ABC123" ],
            doc_version: "0.49.0",
            doc_type: "resource_data",
            doc_ID: "123456",
            resource_data_type: "deletion",
            active: true,
            identity: {
                submitter_type: "user",
                submitter: "foo@example.com"
            },
            publishing_node: "publishingNodeID",
            node_timestamp: "2013-12-12T00:00:00Z",
            create_timestamp: "2013-12-12T00:00:00Z",
            update_timestamp: "2013-12-12T00:00:00Z",
            TOS: {
                submission_TOS: "I Agree Not to be Evil"
            }
        };

        // JSV doesn't handle the reference extensions right 
        // (at least not my modified variant) so we need to
        // hard code the all the extended schemas and check
        // each individually.
        var schemas = [
            "file:lr/schema/v_0_49/deleted_resource_data.json",
            "file:lr/schema/abstract_resource_data.json"
        ];

        _.each(schemas, function(schema){
            expect(refMap[schema]).not.toEqual(undefined);
            expect(json).toValidateAgainstSchema(refMap[schema].schema);
        });
    });

    
});


