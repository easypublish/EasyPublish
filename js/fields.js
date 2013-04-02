function FieldManager() {

	var mediaTypes = ["Audio CD", "Audiotape", "Calculator", "CD-I", "CD-ROM", "Diskette", "Duplication Master", "DVD/ Blu-ray", "E-Mail", "Electronic Slides", "Field Trip", "Filmstrip", "Flash", "Image", "In-Person/Speaker", "Interactive whiteboard", "Manipulative", "MBL (Microcomputer Based)", "Microfiche", "Overhead", "Pamphlet", "PDF", "Person-to-Person", "Phonograph Record", "Photo", "Podcast", "Printed", "Radio", "Robotics", "Satellite", "Slides", "Television", "Transparency", "Video Conference", "Videodisc", "Webpage", "Wiki"];
	var edRoles = ["Administrator", "Mentor", "Parent", "Peer Tutor", "Specialist", "Student", "Teacher", "Team"];
	var edUses = ["Activity", "Analogies", "Assessment", "Auditory", "Brainstorming", "Classifying", "Comparing", "Cooperative Learning", "Creative Response", "Demonstration", "Differentiation ", "Discovery Learning", "Discussion/Debate", "Drill & Practice", "Experiential", "Field Trip", "Game", "Generating hypotheses", "Guided questions ", "Hands-on", "Homework", "Identify similarities & differences", "Inquiry", "Interactive", "Interview/Survey", "Interviews", "Introduction", "Journaling ", "Kinesthetic", "Laboratory", "Lecture", "Metaphors", "Model & Simulation", "Musical", "Nonlinguistic ", "Note taking ", "Peer Coaching", "Peer Response", "Play", "Presentation", "Problem Solving", "Problem-based", "Project", "Questioning ", "Reading", "Reciprocal teaching ", "Reflection", "Reinforcement", "Research", "Review", "Role Playing", "Service learning ", "Simulations", "Summarizing ", "Technology ", "Testing hypotheses", "Thematic instruction ", "Visual/Spatial", "Word association", "Writing"];
	var interactivityTypes = ["Active", "Expositive", "Mixed"];
	var learningResourceTypes = ["Activity", "Assessment", "Audio", "Broadcast", "Calculator", "Discussion", "E-Mail", "Field Trip", "Hands-on", "In-Person/Speaker", "Kinesthetic", "Lab Material (Printed Activities, Instruments, Samples...)", "Lesson Plan", "Manipulative", "MBL (Microcomputer Based)", "Model", "On-Line", "Podcast", "Presentation", "Printed", "Quiz", "Robotics", "Still Image", "Test", "Video", "Wiki", "Worksheet"];
	var groupTypes = ["Class", "Community", "Grade", "Group- large (6+ members)", "Group- small (3-5 members)", "Individual", "Inter-Generational", "Multiple Class", "Pair", "School", "State/Province", "World"];

	this.fieldDictionary = {};

	this.mainFields = [
		new Field("Name", Field.STRING),
		new Field("About", Field.LONG_STRING),
		new Field("URL", Field.URL),
		new Field("Tags", Field.LONG_STRING),
		new Field("Alignment", Field.STRING, {tip:"Add optional alignment details below"}),
		new Field("Audience", Field.LONG_STRING),
		new Field("Date Created", Field.DATE,  {required:false, tip:"Format: YYYY-MM-DD", objectName:"dateCreated"}),
		new Field("Date Modified", Field.DATE,  {required:false, tip:"Format: YYYY-MM-DD", objectName:"dateModified"}),
		new Field("Author", Field.STRING, {tip:"Add optional author details below"}),
		new Field("Publisher", Field.STRING, {tip:"Add optional publisher details below"}),
		new Field("Language", Field.STRING, {objectName:"inLanguage"}),
		new Field("LanguageDescription", Field.LONG_STRING, {required:false, objectName:"inLanguageDescription"}),
		new Field("Media Type", Field.CHOICE, {objectName:"mediaType", choices:mediaTypes}),
		new Field("Educational Role", Field.CHOICE, {objectName:"educationalRole", choices:edRoles}),
		new Field("Educational Use", Field.CHOICE, {objectName:"educationalUse", choices:edUses}),
		new Field("Time Required", Field.DURATION, {tip:"Format: P0Y0M0W0DT0H0M0S", objectName:"timeRequired"}),
		new Field("Typical Age Range", Field.RANGE, {tip:"E.g. 7, 7-12, 18-, -6", objectName:"typicalAgeRange"}),
		new Field("Group Type", Field.CHOICE, {objectName:"groupType", choices:groupTypes}),
		new Field("Interactivity Type", Field.CHOICE, {objectName:"interactivityType", choices:interactivityTypes}),
		new Field("Learning Resource Type", Field.CHOICE, {objectName:"learningResourceType", choices:learningResourceTypes}),
		new Field("Use Rights URL", Field.URL, {objectName:"useRightsUrl"}),
		new Field("Is based on URL", Field.URL, {objectName:"isBasedOnUrl"}),
	];
	for(key in this.mainFields) {
		var field = this.mainFields[key];
		this.fieldDictionary[field.id] = field;
	}

	var alignmentTypes = ["assesses", "teaches", "requires", "textComplexity", "readingLevel", "educationalSubject", "educationLevel"];

	this.alignmentFields = [
		new Field("Alignment Type", Field.CHOICE, {required:false, objectName:"alignmentType", choices:alignmentTypes, 
					tip:"A category of alignment between the learning resource and the framework node"}),
		new Field("Educational Framework", Field.STRING, {required:false, objectName:"educationalFramework",
					tip:"The framework to which the resource being described is aligned"}),
		new Field("Target Name", Field.STRING, {required:false, objectName:"targetName",
					tip:"The name of a node in an established educational framework"}),
		new Field("Target URL", Field.URL, {required:false, objectName:"targetUrl", 
					tip:"The URL of a node in an established educational framework"}),
		new Field("Target Description", Field.STRING, {required:false, objectName:"targetDescription",
					tip:"The description of a node in an established educational framework"}),
	];
	for(key in this.alignmentFields) {
		var field = this.alignmentFields[key];
		this.fieldDictionary[field.id] = field;
	}

	this.authorFields = [
		new Field("URL", Field.URL, {required:false, objectName:"authorURL"}),
		new Field("Email Address", Field.EMAIL, {required:false, objectName:"authorEmail"}),
		new Field("Description", Field.LONG_STRING, {required:false, objectName:"authorDescription"}),
		new Field("Postal Address", Field.LONG_STRING, {required:false, objectName:"authorAddress"})
	];
	for(key in this.authorFields) {
		var field = this.authorFields[key];
		this.fieldDictionary[field.id] = field;
	}


	this.publisherFields = [
		new Field("URL", Field.URL, {required:false, objectName:"publisherURL"}),
		new Field("Email Address", Field.EMAIL, {required:false, objectName:"publisherEmail"}),
		new Field("Description", Field.LONG_STRING, {required:false, objectName:"publisherDescription"}),
		new Field("Postal Address", Field.LONG_STRING, {required:false, objectName:"publisherAddress"})
	];
	for(key in this.publisherFields) {
		var field = this.publisherFields[key];
		this.fieldDictionary[field.id] = field;
	}

	console.log("fieldDictionary:");
	console.log(this.fieldDictionary);

	this.runTests = function() {
		Field.dateTest();
		Field.durationTest();
		Field.uriTest();
	}

}

Field = function(name, type, options) {
	this.name = name;
	this.type = type;
	this.objectName = name;
	this.required = true;

	if(options) {
		this.tip = options.tip;
		this.validation = options.validation;
		this.choices = options.choices;

		if(options.required!=null) {
			this.required = options.required;
		}

		if(options.objectName!=null) {
			this.objectName = options.objectName;
		}
	}
	this.id = this.objectName.replace(/ /g, "-");
	console.log("this.id: " + this.id);


	if(type==Field.STRING || type==Field.NUMBER || type==Field.INTEGER || type==Field.URI  ||
		type==Field.URL || type==Field.EMAIL || type==Field.DURATION || type==Field.RANGE) {
		this.input = $('<input>', {
			type: "text",
			id: this.id,
			title : this.tip,
			class: "text ui-widget-content ui-corner-all"
		});
		this.input.attr("size", "40");
		//console.log("created text input for field: " + this.name);
	} else if(type==Field.LONG_STRING) {
		this.input = $('<textarea>', {
			rows: 3,
			cols: 60,
			id: this.id,
			title : this.tip
		});
	}else if(type==Field.DATE) {
		this.input = $('<input>', {
			type: "text",
			id: this.id,
			title : this.tip,
			class: "text ui-widget-content ui-corner-all"
		});
		this.input.datepicker( {
			dateFormat:"yy-mm-dd" 
		});		
		//console.log("created datepicker input for field: " + this.name);
	} else if(type==Field.BOOLEAN) {
		this.input = $('<input>', {
			type: "checkbox",
			id: this.id,
			title : this.tip
		});
		//console.log("created checkbox input for field: " + this.name);
	}else if(type==Field.CHOICE) {
		this.input = $('<select>', {
			id: this.id,
			title : this.tip
		});
		this.input.append("<option></option>");
		for(key in this.choices) {
	        var choice = this.choices[key];
	        this.input.append("<option>"+choice+"</option>");
	    }
	}  else {
		alert("invalid type for field: " + name);
	}

	this.value = function(val) {
		this.input = $("#"+this.id);
		if(this.type==Field.CHOICE) {
			this.input = this.input.next();
		}
		if(val) {
			console.log("setting value: " + val + " in field " + this.name + " in input " + this.id)
			this.input.val(val);
		} else {
			return this.input.val();
		}
	}


	this.validateField = function() {
		this.input = $("#"+this.id);
		if(this.type==Field.CHOICE) {
			this.input = this.input.next();
		}
		//console.log("validating field input: " + this.input.attr("id"));
		if(this.required) {
			var msg = this.name + ' is required';
			this.input.require(msg);
		}

		if(this.validation) {
			this.input.assert( this.validation, [this.tip] );
		} else if(this.type==Field.NUMBER || this.type==Field.INTEGER
				|| this.type==Field.EMAIL || this.type==Field.URL) {
			//console.log("validating with built-in match");
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
			//console.log("rangeValid: " + rangeValid);
			this.input.assert(rangeValid, ["The second value should be greater than first"] );
			//this.input.assert(Field.rangeValidation(this.input.val()), [this.tip ] );
		}

	}
}
//Field Types
Field.STRING = "string";
Field.LONG_STRING = "long_string";
Field.CHOICE = "choice";
Field.NUMBER = "number";
Field.INTEGER = "integer";
Field.DATE = "date";
Field.DURATION = "duration";
Field.URI = "uri";
Field.URL = "url";
Field.BOOLEAN = "boolean";
Field.EMAIL = "email";
Field.RANGE = "range";

Field.rangeMinMaxValidation = function(value) {
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

Field.uriValidation = function(value) {
	var components = URI.parse(value);
	if(components.errors.length!=0) {
		console.log("errors parsing URI: " + value);
		for(var i=0; i<components.errors.length; i++) {
			console.log(components.errors[i]);
		}
	}
	return components.errors.length==0;
}
Field.uriTest = function() {
	console.log("URI testing")
	var uris = ["cnn.com", "https://www.sri.com", "https://www.sri.com/", "uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body",
			"htt://www.s*&^%$ri.com/", "htt://www.sri.com/"];
	for(key in uris) {
		uri = uris[key];
		var result = Field.uriValidation(uri);
		console.log("Result for: " + uri + " is " + result);
	}
}
