var gen_standards = require("lib/gen/standards");

function split_cell_comma(celldata) {
	return [].concat(celldata.split(/\s*,\r?\n\s*/));
}

function split_cell(celldata) {
	var breaksRemoved= celldata.replaceAll("\\n","");
	return [].concat(breaksRemoved.split(","));
}

// For line break replacement in split_cell
String.prototype.replaceAll = function(expression, result) {
    var textToSearch = this;
    return textToSearch.replace(new RegExp(expression, 'g'), result);
};

function std_lookup(key) {

	// For standard alignments, converts strings to accepted values
	ccssLiteracyDictionary = ["LITERACY","literacy"];
	ccssMathDictionary = ["MATH","math"];
	ccssContentDictionary = ["CONTENT","content"];

	for (k = 0; k <= ccssLiteracyDictionary.length; k++) {
		key = key.replace(ccssLiteracyDictionary[k],"Literacy");
	}

	for (k = 0; k <= ccssMathDictionary.length; k++) {
		key = key.replace(ccssLiteracyDictionary[k],"Math");
	}

	for (k = 0; k <= ccssContentDictionary.length; k++) {
		key = key.replace(ccssLiteracyDictionary[k],"Content");
	}

	var found = gen_standards.find(key);
	if (found)
		return { text: found.dotnotation, value: found.uri };
	return null;
}

var author_objs = [
	{ text: "Person", value: "http://schema.org/Person" },
	{ text: "Organization", value: "http://schema.org/Organization" }
];
var author_map = {},
	author_types = {};

for (var idx in author_objs) {
	author_types[author_objs[idx].text] = author_objs[idx];
	author_map[author_objs[idx].text] = author_objs[idx];
	author_map[author_objs[idx].value] = author_objs[idx];
}

function author_lookup(key) {
	var found = author_map[key];

	if (found) {
		return found;
	}
	return null;
}
// Block for making the accessRights a Choice, would restrict to only CEDS options.
/*var accessRights_objs = [
	{ text: "Free Access", value: "https://ceds.ed.gov/element/001561#FreeAccess" },
	{ text: "Free Access with Registration", value: "https://ceds.ed.gov/element/001561#FreeAccessWithRegistration" },
	{ text: "Limited Free Access", value: "https://ceds.ed.gov/element/001561#LimitedFreeAccess" },
	{ text: "Available for Purchase", value: "https://ceds.ed.gov/element/001561#AvailableForPurchase" },
	{ text: "Available by Subscription", value: "https://ceds.ed.gov/element/001561#AvailableBySubscription" }
	//{ text: "Publisher Defined", value: "" }
];
var accessRights_map = {},
	accessRights_types = {};

for (var idx in accessRights_objs) {
	accessRights_types[accessRights_objs[idx].text] = accessRights_objs[idx];
	accessRights_map[accessRights_objs[idx].text] = accessRights_objs[idx];
	accessRights_map[accessRights_objs[idx].value] = accessRights_objs[idx];
}

function accessRights_lookup(key) {
	var found = accessRights_map[key];

	if (found) {
		return found;
	}
	return null;
}*/

var accessRights_objs = [
	{ text: "Free Access", value: "https://ceds.ed.gov/element/001561#FreeAccess" },
	{ text: "Free Access with Registration", value: "https://ceds.ed.gov/element/001561#FreeAccessWithRegistration" },
	{ text: "Limited Free Access", value: "https://ceds.ed.gov/element/001561#LimitedFreeAccess" },
	{ text: "Available for Purchase", value: "https://ceds.ed.gov/element/001561#AvailableForPurchase" },
	{ text: "Available by Subscription", value: "https://ceds.ed.gov/element/001561#AvailableBySubscription" }
	//{ text: "Publisher Defined", value: "" }
];
var accessRights_map = {},
	accessRights_types = {};

for (var idx in accessRights_objs) {
	accessRights_types[accessRights_objs[idx].text] = accessRights_objs[idx];
	accessRights_map[accessRights_objs[idx].text] = accessRights_objs[idx];
	accessRights_map[accessRights_objs[idx].value] = accessRights_objs[idx];
}

function accessRights_lookup(key) {
	var found = accessRights_map[key];

	if (found) {
		return found;
	}
	return null;
}

function FieldManager() {

	var mediaTypes = ["Audio", "Document", "Image", "Video", "Other"];
	var edRoles = ["administrator","general public","mentor","parent","peer/tutor","professional","student","teacher/education specialist"];
	var edUses = ["assessment","instruction","professional development"];
	var interactivityTypes = ["active","expositive","mixed"];
	var learningResourceTypes = ["alternate assessment","assessment item","course","demonstration/simulation","educator curriculum guide","formative assessment","images/visuals","interim/summative assessment","learning activity","lesson","primary source","rubric scoring guide","self assessment","text","textbook","unit"];
	var groupTypes = ["Class", "Community", "Grade", "Group- large (6+ members)", "Group- small (3-5 members)", "Individual", "Inter-Generational", "Multiple Class", "Pair", "School", "State/Province", "World"];
	var gradeChoices = ["No school completed", "Preschool", "Kindergarten", "First grade", "Second grade", "Third grade", "Fourth grade", "Fifth grade", "Sixth grade", "Seventh grade", "Eighth grade", "Ninth grade", "Tenth grade", "Eleventh Grade", "12th grade, no diploma", "High school diploma", "High school completers (e.g., certificate of attendance)", "High school equivalency (e.g., GED)", "Career and Technical Education certificate", "Grade 13", "Some college but no degree", "Formal award, certificate or diploma (less than one year)", "Formal award, certificate or diploma (more than or equal to one year)", "Associate's degree (two years or more)", "Adult education certification, endorsement, or degree", "Bachelor's (Baccalaureate) degree", "Master's degree (e.g., M.A., M.S., M. Eng., M.Ed., M.S.W., M.B.A., M.L.S.)", "Specialist's degree (e.g., Ed.S.)", "Post-master's certificate", "Graduate certificate", "Doctoral (Doctor's) degree", "First-professional degree", "Post-professional degree", "Doctor's degree-research/scholarship", "Doctor's degree-professional practice", "Doctor's degree-other", "Doctor's degree-research/scholarship", "Other"];
    var typicalAgeRanges = ["0-4","5-8","9-12","13-18","Post-Secondary","Adults"];

	this.fieldDictionary = {};
	this.englishNameDictionary = {};

	this.mainFields = [
		new Field("Resource Title", Field.STRING, {required:true, objectName:"title"}),
		new Field("Thumbnail URL", Field.URL, {objectName:"thumbnailUrl"}),
		new Field("Resource URL", Field.URL, {required:true, objectName:"url"}),
		new Field("Description", Field.LONG_STRING, {required:true, objectName:"description"}),
		new Field("Subject", Field.GROUPED_MULTI_CHOICE, {objectName:"keywords", choices:subjectsData, csvParser:split_cell}),
		new Field("Grade", Field.MULTI_CHOICE, {objectName:"grade", choices:gradeChoices, csvParser:split_cell}),
		new Field("Typical Age Range", Field.MULTI_CHOICE, {objectName:"typicalAgeRange", choices:typicalAgeRanges, csvParser:split_cell}),
		new Field("Date Created", Field.DATE,  {tip:"Date the resource was originally created, Format: YYYY-MM-DD", objectName:"dateCreated"}),
		new Field("Date Modified", Field.DATE,  {tip:"Date the resource was most recently modified, Format: YYYY-MM-DD", objectName:"dateModified"}),
		new Field("Language", Field.STRING, {objectName:"language"}),
		new Field("Media Type", Field.MULTI_CHOICE, {objectName:"mediaType", choices:mediaTypes, csvParser:split_cell}),
		new Field("Learning Resource Type", Field.MULTI_CHOICE, {objectName:"learningResourceType", choices:learningResourceTypes, csvParser:split_cell}),
		new Field("Interactivity", Field.MULTI_CHOICE, {objectName:"interactivityType", choices:interactivityTypes, csvParser:split_cell}),
		new Field("Use Rights URL", Field.URL, {objectName:"useRightsUrl"}),
		new Field("Access Rights URL", Field.CHOICE, {required:true,objectName:"accessRights", choices:_.keys(accessRights_types), option_lookup:accessRights_lookup}),
		new Field("Is based on URL", Field.URL, {objectName:"isBasedOnUrl"}),
	];
	for(key in this.mainFields) {
		var field = this.mainFields[key];
		this.fieldDictionary[field.id] = field;
		this.englishNameDictionary[field.name] = field.id;
	}

	this.alignmentFields = [
		new Field("This Resource Assesses", Field.MULTI_CHOICE,
			{cat_name:"alignmentType", cat_val:"assesses", choices:[], option_lookup:std_lookup, csvParser:split_cell}),
		new Field("This Resource Teaches", Field.MULTI_CHOICE,
			{cat_name:"alignmentType", cat_val:"teaches", choices:[], option_lookup:std_lookup, csvParser:split_cell}),
		new Field("This Resource Requires", Field.MULTI_CHOICE,
			{cat_name:"alignmentType", cat_val:"requires", choices:[], option_lookup:std_lookup, csvParser:split_cell})
	];
	for(key in this.alignmentFields) {
		var field = this.alignmentFields[key];
		this.fieldDictionary[field.id] = field;
		this.englishNameDictionary[field.name] = field.id;
	}

	var accessibilityFeature = ["Alternative Text","Annotations","Audio Description","Book Marks","Braille","Captions","Chemical Markup Language","Described Math","Display Transformability","High Contrast Audio","High Contract Display","Index","Large Print","Latex","Long Description","Math ML","None","Print Page Number","Reading Order","Sign Language","Structural Navigation","Table of Contents","Tactile Graphic","Tactile Object","Tagged PDF","Timing Control","Transcript","TTS Markup","Unlocked"];
	var accessibilityHazard = ["Flashing","No Flashing Hazard","Motion Simulation","No Motion Simulation Hazard","Sound","No Sound Hazard"];
	var accessibilityAPI = ["AndroidAccessibility", "ARIA", "ATK", "AT-SPI", "BlackberryAccessibility", "iAccessible2", "iOSAccessibility", "JavaAccess","Android Accessibility","ARIA","ATK","AT-SPI","Blackberry Accessibility","iAccessible2","iOS Accessibility","Java","Accessibility","Mac OSX Accessibility","MSAA","UI Automation"];
	var accessibilityControl = ["Full Keyboard Control","Full Mouse Control","Full Switch Control","Full Touch Control","Full Video Control","Full Voice Control"];
	this.a11yFields = [
		new Field("Accessibility Feature", Field.MULTI_CHOICE, {objectName:"accessibilityFeature", choices:accessibilityFeature, csvParser:split_cell}),
		new Field("Accessibility Hazard", Field.MULTI_CHOICE, {objectName:"accessibilityHazard", choices:accessibilityHazard, csvParser:split_cell}),
		new Field("Accessibility API", Field.MULTI_CHOICE, {objectName:"accessibilityAPI", choices:accessibilityAPI, csvParser:split_cell}),
		new Field("Accessibility Control", Field.MULTI_CHOICE, {objectName:"accessibilityControl", choices:accessibilityControl, csvParser:split_cell})
	];
	for(key in this.a11yFields) {
		var field = this.a11yFields[key];
		this.fieldDictionary[field.id] = field;
		this.englishNameDictionary[field.name] = field.id;
	}


	this.authorFields = [
		new Field("Author Type", Field.CHOICE, {objectName:"author_type", choices:_.keys(author_types), option_lookup:author_lookup, option_default:"Person" }),
		new Field("Author Name", Field.STRING, {objectName:"author_name"}),
		new Field("Author URL", Field.URL, {objectName:"author_url"}),
		new Field("Author Email Address", Field.EMAIL, {objectName:"author_email"})
	];
	for(key in this.authorFields) {
		var field = this.authorFields[key];
		this.fieldDictionary[field.id] = field;
		this.englishNameDictionary[field.name] = field.id;
	}

	this.publisherFields = [
		new Field("Publisher Name", Field.STRING, {required:true, objectName:"publisher_name"}),
		new Field("Publisher URL", Field.URL, {objectName:"publisher_url"}),
		new Field("Publisher Email Address", Field.EMAIL, {objectName:"publisher_email"})
	];
	for(key in this.publisherFields) {
		var field = this.publisherFields[key];
		this.fieldDictionary[field.id] = field;
		this.englishNameDictionary[field.name] = field.id;
	}

	this.runTests = function() {
		Field.dateTest();
		Field.durationTest();
		Field.uriTest();
	}
}

function Field(name, type, options, index) {
	this.name = name;
	if(index) {
		this.name += " " + index;
	}
	this.type = type;
	this.objectName = name;
	this.required = false;

	this.clone = function(index) {
		var cloned = new Field(name, type, options, index);
		return cloned;
	}

	if(options) {
		this.tip = options.tip;
		this.validation = options.validation;
		this.choices = options.choices;
		this.values = options.values;
		this.cat_name  = options.cat_name || "";
		this.cat_val  = options.cat_val || "";
		this.option_lookup = options.option_lookup || false;
		this.option_default = options.option_default || false;


		if(options.required!=null) {
			this.required = options.required;
		}

		if (this.cat_name!="" && this.cat_val!="")
			this.objectName = this.cat_name+"_"+this.cat_val;


		if(options.objectName!=null) {
			this.objectName = options.objectName;
		}

		if(options.csvParser!=null) {
			this.csvParser = options.csvParser;
		} else {
			this.csvParser = false;
		}
	}
	this.id = this.objectName.replace(/ /g, "-");
	if(index) {
		this.id += "_" + index;
	}

	if(type==Field.URI && !this.validation ) {
		this.validation = Field.uriValidation;
	}


	if(type==Field.STRING || type==Field.NUMBER || type==Field.INTEGER || type==Field.URI  ||
		type==Field.URL || type==Field.EMAIL || type==Field.DURATION || type==Field.RANGE) {
		this.input = $('<input>', {
			type: "text",
			id: this.id,
			name: this.id,
			title : this.tip,
			class: "text ui-widget-content ui-corner-all"
		});
		this.input.attr("size", "50");
		this.input.attr("autocomplete", "off");

	} else if(type==Field.LONG_STRING) {
		this.input = $('<textarea>', {
			rows: 3,
			cols: 50,
			id: this.id,
			name: this.id,
			title : this.tip
		});
	}else if(type==Field.DATE) {
		this.input = $('<input>', {
			type: "text",
			id: this.id,
			name: this.id,
			title : this.tip,
			class: "text ui-widget-content ui-corner-all"
		});
		this.input.attr("size", "50");
		this.input.datepicker( {
			dateFormat:"yy-mm-dd"
		});
	} else if(type==Field.BOOLEAN) {
		this.input = $('<input>', {
			type: "checkbox",
			id: this.id,
			name: this.id,
			title : this.tip
		});
	}else if(type==Field.CHOICE) {
		this.input = $('<select>', {
			id: this.id,
			name: this.id,
			title : this.tip
		});
		if (!this.option_default)
			this.input.append("<option></option>");
		for(key in this.choices) {
	        var choice = this.choices[key];
	        var value = undefined;
	        if(this.values) {
	        	value = {
	        		value: this.values[key],
	        		text: choice
	        	}
	        } else if (this.option_lookup && (value = this.option_lookup(choice)) != null) {
				value = _.clone(value);
	        } else {
	        	value = {
					text: choice
	        	};
	        }
			if (this.option_default == choice) {
				value.selected = true;
			}
			this.input.append($('<option>', value ));

	    }

	}else if(type==Field.MULTI_CHOICE) {
		this.input = $('<select>', {
			class: "multi-choice",
			multiple:true,
			id: this.id,
			name: this.id,
			title : this.tip
		});
		this.input.append("<option></option>");
		for(key in this.choices) {
	        var choice = this.choices[key];
	        if(this.values) {
	        	var value = this.values[key];
	        	this.input.append("<option value='"+value+"'>"+choice+"</option>");
	        } else {
	        	this.input.append("<option>"+choice+"</option>");
	        }
	    }
	} else if(type==Field.GROUPED_MULTI_CHOICE) {
		this.input = $('<select>', {
			class: "multi-choice",
			multiple:true,
			id: this.id,
			name: this.id,
			title : this.tip
		});
		this.input.append("<option></option>");
		var me = this;

		function buildOutChoices(currentNode) {

			if (currentNode.children.length==0) {
				var newopt = $("<option>", {
					text: currentNode.name,
					class: "depth-"+this.depth
				});
				return newopt;
			} else if (this.depth <= 1){
				var newoptgroup = $("<optgroup>", {
					label: currentNode.name
				});
				var subopts = _.map(currentNode.children, buildOutChoices, {depth:this.depth+1});
				newoptgroup.append(subopts);
				return newoptgroup;
			} else {
				var div = $("<div>");
				var newopt = $("<option>", {
					text: currentNode.name,
					class: "optgroup depth-"+this.depth
				});
				div.append(newopt);
				var subopts = _.map(currentNode.children, buildOutChoices, {depth:this.depth+1});
				//subopts.splice(0,0,newopt);
				div.append(subopts);
				//console.log(div.html())
				return $(div.html());
			}
		}
		var root = _.map([this.choices], buildOutChoices, {depth:0});
		this.input.append(root[0].children());
	} else if(type==Field.TREE_CHOICE) {
		this.treeMenu = new TreeMenu(this.id);
		this.treeMenu.setChoices(this.choices);
		this.input = this.treeMenu.input;
	}  else if(type==Field.STANDARDS_TREE_CHOICE) {
		this.treeMenu = new TreeMenu(this.id);
		this.treeMenu.setCCSSChoices(this.choices);
		this.input = this.treeMenu.input;
	}  else {
		alert("invalid type for field: " + name);
	}

	this.value = function(val) {
		var that = this;
		this.input = this.input || $("#"+this.id);
		if(this.type==Field.TREE_CHOICE || this.type==Field.STANDARDS_TREE_CHOICE) {
			this.input = this.treeMenu.input;
			this.treeMenu.setSelected(val);
		} else if(val !== undefined && (this.type==Field.GROUPED_MULTI_CHOICE || this.type==Field.MULTI_CHOICE)) {
			var remaped_val = [];
			_.each(val, function(item) {
				var $sel = $(this.input),
					the_val = item;

				if (that.option_lookup) {
					var found = that.option_lookup(item);
					if (found) {
						item = found.text;
						the_val = found.value;
					}
				}
				remaped_val.push(the_val);
				// var $exiting_opts = $sel.find("option[value='"+the_val+"']");
				var $exiting_opts = $sel.find("option").filter(function(idx){ return this.value == the_val; });
				if ($exiting_opts.length == 0) {
					$sel.append($("<option>", { text: item, value: the_val }));
				}
			}, {input:this.input});
			val = remaped_val;
		} else if (val!==undefined && this.type==Field.CHOICE && this.option_lookup) {
			var lookup = this.option_lookup(val);
			if (lookup)
				val = lookup.value;
		}

		if(val || val=="") {
			this.input.val(val);
		} else {
			return this.input.val();
		}
	}


		/* ORIGINAL VALIDATION USING VALIDITY.JS, NO LONGER USING THIS, USING VALIDATOR.JS
		if(this.required) {
			var msg = this.name + ' is required';
			this.input.require(msg);
		}

		if(this.validation) {
			this.input.assert( this.validation, [this.tip] );
		} else if(this.type==Field.NUMBER || this.type==Field.INTEGER
				|| this.type==Field.EMAIL || this.type==Field.URL) {
			//user match() as implemented by validity.js to validate these
			this.input.match(this.type);
		}else if(this.type==Field.DATE) {
			dateRegex = new RegExp('^(\\d\\d\\d\\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$)');
			this.input.match(dateRegex, this.tip);
		}else if(this.type==Field.DURATION) {
			durationRegex = new RegExp(
				'^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' +
				'(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$');
			this.input.match(durationRegex, this.tip);
			//this.input.assert(Field.durationValidation(this.input.val()), [this.tip ] );
		}else if(this.type==Field.URI) {
			this.input.assert(Field.uriValidation(this.input.val()), [this.tip ] );
		}else if(this.type==Field.RANGE) {
			rangeRegex = new RegExp('(^[\\d]+-[\\d]+$)|(^[\\d]+-$)|(^-[\\d]+$)|(^[\\d]+$)');
			this.input.match(rangeRegex, this.tip);
			var rangeValid = Field.rangeMinMaxValidation(this.input.val());
			this.input.assert(rangeValid, ["The second value should be greater than first"] );
			//this.input.assert(Field.rangeValidation(this.input.val()), [this.tip ] );
		}*/
}
//Field Types
Field.STRING = "string";
Field.LONG_STRING = "long_string";
Field.CHOICE = "choice";
Field.MULTI_CHOICE = "multi_choice";
Field.GROUPED_MULTI_CHOICE = "grouped_multi_choice";
Field.TREE_CHOICE = "tree_choice";
Field.STANDARDS_TREE_CHOICE = "standards_tree_choice";
Field.NUMBER = "number";
Field.INTEGER = "integer";
Field.DATE = "date";
Field.DURATION = "duration";
Field.URI = "uri";
Field.URL = "url";
Field.BOOLEAN = "boolean";
Field.EMAIL = "email";
Field.RANGE = "range";

Field.prototype.rangeMinMaxValidation = function(value) {
	var rangeRegex = new RegExp('^([\\d]+)-([\\d]+)$');
	var m = rangeRegex.exec(value);
	if(!m) return true;
	else if(m.length<3) {
		return true;
	} else {
		var result = (0+m[2])>(0+m[1]);
		return result;
	}
}

Field.prototype.uriValidation = function(value) {
	var components = URI.parse(value);
	if(components.errors.length!=0) {
		console.log("errors parsing URI: " + value);
		for(var i=0; i<components.errors.length; i++) {
			console.log(components.errors[i]);
		}
	}
	return components.errors.length==0;
}
Field.prototype.uriTest = function() {
	var uris = ["cnn.com", "https://www.sri.com", "https://www.sri.com/", "uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body",
			"htt://www.s*&^%$ri.com/", "htt://www.sri.com/"];
	for(key in uris) {
		uri = uris[key];
		var result = Field.uriValidation(uri);
		console.log("Result for: " + uri + " is " + result);
	}
}
