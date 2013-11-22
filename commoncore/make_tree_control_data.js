var fs = require("fs"),
    _ = require("underscore")._;

var commonjs_map = "../lib/gen/standards.js";

var work_files = [
    {
        label: "Common Core State Standards for English Language Arts",
        source: "./ccss_ela_D10003FC.json",
        target: "../js/data/ccss_ela.json",
    },
    {
        label: "Common Core State Standards for Math",
        source: "./ccss_math_D10003FB.json",
        target: "../js/data/ccss_math.json"
    }

];

var all_exports = { 
    map: {},
    data: [],
    frameworks:[]
};

var current_framework = -1;


var generated_warning = fs.readFileSync("./warning_template.js").toString();
var node_template = fs.readFileSync("./node_template.html").toString();

function processContents(data) {
    var raw_json = JSON.parse(data),
        tree_data = makeFancyTreeData(raw_json);

    console.log(JSON.stringify(tree_data, null, 4));
    return tree_data;
}


function addMapping(nodedata) {
    if (!nodedata.data.dotnotation)
        return;
    var obj = {dotnotation: nodedata.data.dotnotation, uri: nodedata.key, fw: current_framework};
    var len = all_exports.data.push(obj);
    all_exports.map[obj.uri] = all_exports.map[obj.dotnotation] = len-1;
}


function makeFancyTreeData(current_set) {
    var tree_data = [];
    _.each(current_set, function(parent){

        
        var std_uri = parent.id;
        var std_dotnotation = false;
        var std_text = parent.text;
        var std_grade_level = [];
        if (parent.skos_exactMatch) {
            for (var i=0; i<parent.skos_exactMatch.length; i++) {
                if (parent.skos_exactMatch[i].uri.indexOf('http://corestandards.org') == 0) {
                    std_uri = parent.skos_exactMatch[i].uri;
                    break;
                }
            }
        }

        if (parent.asn_statementNotation) {
            std_dotnotation = parent.asn_statementNotation;
        }

        if (parent.dcterms_educationLevel && _.isArray(parent.dcterms_educationLevel)) {
            std_grade_level = _.map(parent.dcterms_educationLevel, function(level){
                return level.prefLabel;
            });
        } else if (parent.dcterms_educationLevel) {
            std_grade_level.push(parent.dcterms_educationLevel.prefLabel);
        }

        

        var nodedata = {
            title: _.template(node_template, {dotnotation: std_dotnotation, text: std_text}).trim(),
            key: std_uri,
            data: {
                dotnotation: std_dotnotation,
                edlevel: std_grade_level
            }
        }
        addMapping(nodedata);
        
        if (parent.children && parent.children.length>0) {
            nodedata.children = makeFancyTreeData(parent.children);
        }

        tree_data.push(nodedata);
    

    });
    return tree_data;
}


_.each(work_files, function(work, index){
    
    fs.readFile(work.source, null, function(err, data){
        current_framework = all_exports.frameworks.push(work.label) - 1;

        var processed = processContents(data);

        fs.writeFile(work.target, JSON.stringify(processed, null, 4), null, function(err){
            console.log("Index:"+index);
            console.log("length:"+work_files.length);
            if (index==work_files.length-1) {
                fs.writeFile(commonjs_map, _.template(generated_warning, {exports:all_exports}), function(err){
                    if (err)
                        console.log(err);
                    else
                        console.log("wrote file");
                });
            }
        });

    });
});