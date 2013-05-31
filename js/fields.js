function FieldManager() {
	
	var mediaTypes = ["Audio", "Document", "Image", "Video", "Other"]; 
	var edRoles = ["Administrator", "Mentor", "Parent", "Peer Tutor", "Specialist", "Student", "Teacher", "Team"];
	var edUses = ["Activity", "Analogies", "Assessment", "Auditory", "Brainstorming", "Classifying", "Comparing", "Cooperative Learning", "Creative Response", "Demonstration", "Differentiation ", "Discovery Learning", "Discussion/Debate", "Drill & Practice", "Experiential", "Field Trip", "Game", "Generating hypotheses", "Guided questions ", "Hands-on", "Homework", "Identify similarities & differences", "Inquiry", "Interactive", "Interview/Survey", "Interviews", "Introduction", "Journaling ", "Kinesthetic", "Laboratory", "Lecture", "Metaphors", "Model & Simulation", "Musical", "Nonlinguistic ", "Note taking ", "Peer Coaching", "Peer Response", "Play", "Presentation", "Problem Solving", "Problem-based", "Project", "Questioning ", "Reading", "Reciprocal teaching ", "Reflection", "Reinforcement", "Research", "Review", "Role Playing", "Service learning ", "Simulations", "Summarizing ", "Technology ", "Testing hypotheses", "Thematic instruction ", "Visual/Spatial", "Word association", "Writing"];
	var interactivityTypes = ["interactive", "passive", "social", "programmatic (machine-human interaction)", "one-on-one", "async", "sync", "group"];
	var learningResourceTypes = ["Activity", "Assessment", "Audio", "Calculator", "Demonstration", "Game", "Interview", "Lecture",
								 "Lesson Plan", "Simulation", "Presentation", "Other"];
	var groupTypes = ["Class", "Community", "Grade", "Group- large (6+ members)", "Group- small (3-5 members)", "Individual", "Inter-Generational", "Multiple Class", "Pair", "School", "State/Province", "World"];
	var gradeChoices = ["No school completed", "Preschool", "Kindergarten", "First grade", "Second grade", "Third grade", "Fourth grade", "Fifth grade", "Sixth grade", "Seventh grade", "Eighth grade", "Ninth grade", "Tenth grade", "Eleventh Grade", "12th grade, no diploma", "High school diploma", "High school completers (e.g., certificate of attendance)", "High school equivalency (e.g., GED)", "Career and Technical Education certificate", "Grade 13", "Some college but no degree", "Formal award, certificate or diploma (less than one year)", "Formal award, certificate or diploma (more than or equal to one year)", "Associate's degree (two years or more)", "Adult education certification, endorsement, or degree", "Bachelor's (Baccalaureate) degree", "Master's degree (e.g., M.A., M.S., M. Eng., M.Ed., M.S.W., M.B.A., M.L.S.)", "Specialist's degree (e.g., Ed.S.)", "Post-master's certificate", "Graduate certificate", "Doctoral (Doctor's) degree", "First-professional degree", "Post-professional degree", "Doctor's degree-research/scholarship", "Doctor's degree-professional practice", "Doctor's degree-other", "Doctor's degree-research/scholarship", "Other"];
	var edGovSubjects = ["Arts & Music", "Artists", "Music", "Blues, Gospel, Folk", "Jazz", "Sheet Music", "Other Music", "Theatre & Film", "Visual arts", "Architecture", "Drawing & Prints", "Painting", "Photography", "Sculpture", "Other Visual arts", "Other Arts & Music", "Health & Phys Ed", "Phys ed, exercise", "Substance abuse", "Other Health", "Language Arts", "Literature & Writers", "American Literature", "Poetry", "Other Literature", "Reading", "Other Language Arts", "Math", "Algebra", "Data Analysis", "Geometry", "Measurement", "Number & Operations", "Other Math", "Science", "Applied Sciences", "Computers/Tech", "Engineering", "Earth Sciences", "Climate Change", "Environment", "Geology", "Oceans", "Other Earth Sciences", "Life Sciences", "Animals/Zoology", "Botany", "Cells", "Diseases", "Genes, Evolution", "Human Body", "Interdependence", "Medicine", "Other Life Sciences", "Physical Sciences", "Chemistry", "Energy", "Physics", "Other Physical Sciences", "Space Sciences", "Aeronautics/Flight", "Astronomy", "Other Space Sciences", "Other Science", "World Studies", "Countries & Continents", "Africa", "Arctic, Antarctica", "Other Countries & Continents", "Foreign Languages", "World History", "China", "Europe", "Russia, Soviet Union", "Other World History", "Other World Studies", "U.S. History Topics", "Business & Work", "Business", "Careers", "Economics", "Entrepreneurship", "Labor", "Ethnic Groups", "African Americans", "Asian Americans", "Hispanic Americans", "Native Americans", "Famous People", "Explorers", "Inventors", "Leaders", "Scientists", "Others", "Government", "Congress", "Courts", "Elections", "Military", "Presidents", "U.S. Constitution", "Other", "Movements", "Civil Rights", "Immigration & Migration", "Transportation", "Women's History", "States & Regions", "California", "Massachusetts", "Midwest", "New Mexico", "New York", "Northeast", "Pennsylvania", "South", "Virginia", "West", "Others", "Wars", "American Revolution", "Civil War", "World War I", "World War II", "Other Wars", "Other History & Soc Studies", "Anthropology", "Geography", "Natural Disasters", "Religion & Society", "Slavery", "Other Resources", "U.S. Time Periods", "-1607: Three Worlds Meet", "1607-1763: Colonization", "1763-1815: Revolution", "1801-1861: Expansion", "1850-1877: Civil War & Reconstruction", "1865-1920: Modern America", "1914-1945: World Wars", "1945-Present: Contemporary America", "Other History & Social Studies: U.S. History Time Periods"];

	this.fieldDictionary = {};

	this.mainFields = [
		new Field("Resource Title", Field.STRING, {required:true, objectName:"title"}),
		new Field("Resource URL", Field.URL, {required:true, objectName:"url"}),
		new Field("Description", Field.LONG_STRING, {objectName:"description"}),
		new Field("Subject", Field.TREE_CHOICE, {objectName:"keywords", choices:subjectsData}),
		new Field("Grade", Field.CHOICE, {objectName:"grade", choices:gradeChoices}),
		new Field("Date Created", Field.DATE,  {tip:"Date the resource was originally created, Format: YYYY_MM_DD", objectName:"dateCreated"}),
		new Field("Date Modified", Field.DATE,  {tip:"Date the resource was most recently modified, Format: YYYY_MM_DD", objectName:"dateModified"}),
		new Field("Language", Field.STRING, {objectName:"language"}),
		new Field("Media Type", Field.CHOICE, {objectName:"mediaType", choices:mediaTypes}),
		new Field("Learning Resource Type", Field.CHOICE, {objectName:"learningResourceType", choices:learningResourceTypes}),
		new Field("Interactivity", Field.CHOICE, {objectName:"interactivityType", choices:interactivityTypes}),
		new Field("Use Rights URL", Field.URL, {objectName:"useRightsUrl"}),
		new Field("Is based on URL", Field.URL, {objectName:"isBasedOnUrl"}),
	];
	for(key in this.mainFields) {
		var field = this.mainFields[key];
		this.fieldDictionary[field.id] = field;
	}

	var alignmentTypes = ["assesses", "teaches", "requires"];
	var standardFrameworks = ["Common Core Math", "Common Core Language Arts"];//, "State Standard"];

	this.alignmentFields = [
		new Field("This resource...", Field.CHOICE, {objectName:"alignmentType", choices:alignmentTypes}),
		new Field("Standard Framework", Field.CHOICE, {objectName:"educationalFramework",
					tip:"The framework to which the resource being described is aligned", choices:standardFrameworks}),

		//Giving up altogether on trying to make the standards menu a general type, it need to be handled as its own special case.
		new Field("ELA Standard", Field.STANDARDS_TREE_CHOICE, {choices:standardsTree.CCSS["ELA-Literacy"]}),
		new Field("Math Standard", Field.STANDARDS_TREE_CHOICE, {choices:standardsTree.CCSS.Math}),

	];
	for(key in this.alignmentFields) {
		var field = this.alignmentFields[key];
		this.fieldDictionary[field.id] = field;
		console.log("alignmentFields dictionary key: " + field.id)
	}

	this.authorFields = [
		new Field("Name", Field.STRING, {objectName:"author_name"}),
		new Field("URL", Field.URL, {objectName:"author_url"}),
		new Field("Email Address", Field.EMAIL, {objectName:"author_email"})
	];
	for(key in this.authorFields) {
		var field = this.authorFields[key];
		this.fieldDictionary[field.id] = field;
	}

	this.publisherFields = [
		new Field("Name", Field.STRING, {objectName:"publisher_name"}),
		new Field("URL", Field.URL, {objectName:"publisher_url"}),
		new Field("Email Address", Field.EMAIL, {objectName:"publisher_email"})
	];
	for(key in this.publisherFields) {
		var field = this.publisherFields[key];
		this.fieldDictionary[field.id] = field;
	}

	this.runTests = function() {
		Field.dateTest();
		Field.durationTest();
		Field.uriTest();
	}
}

Field = function(name, type, options, index) {
	this.name = name;
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

		if(options.required!=null) {
			this.required = options.required;
		}

		if(options.objectName!=null) {
			this.objectName = options.objectName;
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
		this.input = $("#"+this.id);
		if(this.type==Field.CHOICE && this.id.lastIndexOf("educationalFramework")==-1) {
			this.input = this.input.next();
		}
		if(this.type==Field.TREE_CHOICE || this.type==Field.STANDARDS_TREE_CHOICE) {
			this.input = this.treeMenu.input;
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
	var uris = ["cnn.com", "https://www.sri.com", "https://www.sri.com/", "uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body",
			"htt://www.s*&^%$ri.com/", "htt://www.sri.com/"];
	for(key in uris) {
		uri = uris[key];
		var result = Field.uriValidation(uri);
		console.log("Result for: " + uri + " is " + result);
	}
}
