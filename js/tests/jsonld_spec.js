describe("JSON-LD", function() {
    var jsonldUtil = require("lib/jsonldUtil");

    var htmlmicrodata = {
        "items": [{
            "type": ["http://schema.org/CreativeWork"],
            "id": "http://www.example.com/1",
            "properties": {
                "isBasedOnUrl": ["http://www.example.com/basedUpon/1"],
                "interactivityType": ["interactive"],
                "name": ["Example Resource modified again"],
                "language": ["English"],
                "author": [{
                    "type": ["http://schema.org/Person"],
                    "properties": {
                        "url": [
                            "http://example.com/author/joe_example"
                        ],
                        "name": [
                            "Joe Example"
                        ],
                        "email": [
                            "joe@example.com"
                        ]
                    }
                }],
                "url": ["http://www.example.com/1"],
                "publisher": [{
                    "type": ["http://schema.org/Organization"],
                    "properties": {
                        "url": ["http://example.com/publisher"],
                        "name": ["Example Publishing"],
                        "email": ["publishing@example.com"]
                    }
                }],
                "mediaType": ["Audio", "Video"],
                "dateCreated": ["2013-12-02"],
                "educationalAlignment": [{
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["educationLevel"],
                        "educationalFramework": ["US K-12 Grade Levels"],
                        "targetName": ["First grade"]
                    }
                }, {
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["educationLevel"],
                        "educationalFramework": ["US K-12 Grade Levels"],
                        "targetName": ["Second grade"]
                    }
                }, {
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["assesses"],
                        "educationalFramework": ["Common Core State Standards for English Language Arts"],
                        "targetName": ["CCSS.ELA-Literacy.CCRA.R.2"],
                        "targetUrl": ["http://corestandards.org/ELA-Literacy/CCRA/R/2"]
                    }
                }, {
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["teaches"],
                        "educationalFramework": ["Common Core State Standards for English Language Arts"],
                        "targetName": ["CCSS.ELA-Literacy.CCRA.R.2"],
                        "targetUrl": ["http://corestandards.org/ELA-Literacy/CCRA/R/2"]
                    }
                }, {
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["teaches"],
                        "educationalFramework": ["Common Core State Standards for English Language Arts"],
                        "targetName": ["CCSS.ELA-Literacy.CCRA.R.3"],
                        "targetUrl": ["http://corestandards.org/ELA-Literacy/CCRA/R/3"]
                    }
                }, {
                    "type": ["http://schema.org/AlignmentObject"],
                    "properties": {
                        "alignmentType": ["requires"],
                        "educationalFramework": ["Common Core State Standards for English Language Arts"],
                        "targetName": ["CCSS.ELA-Literacy.CCRA.R.1"],
                        "targetUrl": ["http://corestandards.org/ELA-Literacy/CCRA/R/1"]
                    }
                }],
                "learningResourceType": ["Activity"],
                "keywords": ["Artists", "Music", "Blues, Gospel, Folk"],
                "useRightsUrl": ["http://www.example.com/useRights/1"],
                "dateModified": ["2013-12-02"],
                "description": ["This is a description"]
            }
        }]
    };

    var jsonld = {
            "@context": [
                {
                    "@vocab": "http://schema.org/",
                    "url": { "@type": "@id" }
                },
                {
                    "lrmi": "http://lrmi.net/the-specification#",
                    "useRightsUrl": {"@id": "lrmi:useRightsUrl", "@type": "@id"}
                }
            ],
            "@type": "CreativeWork",
            "@id": "http://www.example.com/1",
            "isBasedOnUrl": "http://www.example.com/basedUpon/1",
            "interactivityType": "interactive",
            "name": "Example Resource modified again",
            "language": "English",
            "author": {
                "@type": "Person",   
                "url": "http://example.com/author/joe_example",
                "name": "Joe Example",
                "email": "joe@example.com"      
            },
            "url": "http://www.example.com/1",
            "publisher": {
                "@type": "Organization",
                "url": "http://example.com/publisher",
                "name": "Example Publishing",
                "email": "publishing@example.com"
            },
            "mediaType": ["Audio", "Video"],
            "dateCreated": "2013-12-02",
            "educationalAlignment": [
                {
                    "@type": "AlignmentObject",    
                    "alignmentType": "educationLevel",
                    "educationalFramework": "US K-12 Grade Levels",
                    "targetName": "First grade"
                }, {
                    "@type": "AlignmentObject",    
                    "alignmentType": "educationLevel",
                    "educationalFramework": "US K-12 Grade Levels",
                    "targetName": "Second grade"
                }, {
                    "@type": "AlignmentObject",
                    "alignmentType": "assesses",
                    "educationalFramework": "Common Core State Standards for English Language Arts",
                    "targetName": "CCSS.ELA-Literacy.CCRA.R.2",
                    "targetUrl": "http://corestandards.org/ELA-Literacy/CCRA/R/2"
                }, { 
                    "@type": "AlignmentObject",
                    "alignmentType": "teaches",
                    "educationalFramework": "Common Core State Standards for English Language Arts",
                    "targetName": "CCSS.ELA-Literacy.CCRA.R.2",
                    "targetUrl": "http://corestandards.org/ELA-Literacy/CCRA/R/2"
                }, {
                    "@type": "AlignmentObject",
                    "alignmentType": "teaches",
                    "educationalFramework": "Common Core State Standards for English Language Arts",
                    "targetName": "CCSS.ELA-Literacy.CCRA.R.3",
                    "targetUrl": "http://corestandards.org/ELA-Literacy/CCRA/R/3"
                }, { 
                    "@type": "AlignmentObject",
                    "alignmentType": "requires",
                    "educationalFramework": "Common Core State Standards for English Language Arts",
                    "targetName": "CCSS.ELA-Literacy.CCRA.R.1",
                    "targetUrl": "http://corestandards.org/ELA-Literacy/CCRA/R/1"
                }],
                "learningResourceType": "Activity",
                "keywords": ["Artists", "Music", "Blues, Gospel, Folk"],
                "useRightsUrl": "http://www.example.com/useRights/1",
                "dateModified": "2013-12-02",
                "description": "This is a description"
        };

    it("should convert HTML Microdata to JSON-LD", function() {
        var result = jsonldUtil.convertToJSONLD(htmlmicrodata);
        // console.log(JSON.stringify(result));
        // console.log(JSON.stringify(jsonld));
        
        expect(jsonld["@context"]).toEqual(result["@context"]);
        expect(jsonld).toEqual(result);
        
    });

    it("should convert JSON-LD to HTML Microdata", function() {
        var result = jsonldUtil.convertFromJSONLD(jsonld);

        expect(htmlmicrodata).toEqual(result);
    });

    it("should always return only the resource data as HTML Microdata", function(){
        var result = jsonldUtil.getResourceDataAsMicrodata({ "resource_data": jsonld, "payload_schema":["JSON-LD"] }),
            result2 = jsonldUtil.getResourceDataAsMicrodata({ "resource_data": htmlmicrodata, "payload_schema": ["application/microdata+json"] });

        expect(result).toEqual(htmlmicrodata);
        expect(result2).toEqual(htmlmicrodata);
    });

});