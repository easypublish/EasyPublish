/*
 * Much of this is lifted from validity.js:
 * http://validity.thatscaptaintoyou.com/
 */
function Validator() {

    var patterns = {
        integer:/^\d+$/,
        
        // Used to use Date.parse(), which was the cause of Issue 9,  where the 
        // function would accept 09/80/2009 as parseable. The fix is to use a 
        // RegExp that will only accept American Middle-Endian form. See the 
        // Internationalization section in the documentation for how to cause 
        // it to support other date formats:
        //date:/^((0?\d)|(1[012]))[\/-]([012]?\d|30|31)[\/-]\d{1,4}$/, 
        date:/^(\d\d\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])$)/,
        duration:/^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$/,
        rangeRegex:/(^[\d]+-[\d]+$)|(^[\d]+-$)|(^-[\d]+$)|(^[\d]+$)/,
        
        email:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
        usd:/^\$?((\d{1,3}(,\d{3})*)|\d+)(\.(\d{2})?)?$/,            
        url:/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
        
        // Number should accept floats or integers, be they positive or 
        // negative. It should also support scientific-notation, written as a 
        // lower or capital 'E' followed by the radix. Number assumes base 10. 
        // Unlike the native parseFloat or parseInt functions, this should not 
        // accept trailing Latin characters.
        number:/^[+-]?(\d+(\.\d*)?|\.\d+)([Ee]-?\d+)?$/,
        
        zip:/^\d{5}(-\d{4})?$/,
        phone:/^[2-9]\d{2}-\d{3}-\d{4}$/,
        guid:/^(\{?([0-9a-fA-F]){8}-(([0-9a-fA-F]){4}-){3}([0-9a-fA-F]){12}\}?)$/,
        time12:/^((0?\d)|(1[012])):[0-5]\d?\s?[aApP]\.?[mM]\.?$/,
        time24:/^(20|21|22|23|[01]\d|\d)(([:][0-5]\d){1,2})$/,

        nonHtml:/^[^<>]*$/
    }

    var messages = {

        require:"#{field} is required.",

        // Format validators:
        match:"#{field} is in an invalid format.",
        integer:"#{field} must be a positive, whole number.",
        date:"#{field} must be formatted as a date. (mm/dd/yyyy)",
        email:"#{field} must be formatted as an email.",
        usd:"#{field} must be formatted as a US Dollar amount.",
        url:"#{field} must be formatted as a URL.",
        number:"#{field} must be formatted as a number.",
        zip:"#{field} must be formatted as a zipcode ##### or #####-####.",
        phone:"#{field} must be formatted as a phone number ###-###-####.",
        guid:"#{field} must be formatted as a guid like {3F2504E0-4F89-11D3-9A0C-0305E82C3301}.",
        time24:"#{field} must be formatted as a 24 hour time: 23:00.",
        time12:"#{field} must be formatted as a 12 hour time: 12:00 AM/PM",

        // Value range messages:
        lessThan:"#{field} must be less than #{max}.",
        lessThanOrEqualTo:"#{field} must be less than or equal to #{max}.",
        greaterThan:"#{field} must be greater than #{min}.",
        greaterThanOrEqualTo:"#{field} must be greater than or equal to #{min}.",
        range:"#{field} must be between #{min} and #{max}.",

        // Value length messages:
        tooLong:"#{field} cannot be longer than #{max} characters.",
        tooShort:"#{field} cannot be shorter than #{min} characters.",

        // Composition validators:
        nonHtml:"#{field} cannot contain HTML characters.",
        alphabet:"#{field} contains disallowed characters.",

        minCharClass:"#{field} cannot have more than #{min} #{charClass} characters.",
        maxCharClass:"#{field} cannot have less than #{min} #{charClass} characters.",
        
        // Aggregate validator messages:
        equal:"Values don't match.",
        distinct:"A value was repeated.",
        sum:"Values don't add to #{sum}.",
        sumMax:"The sum of the values must be less than #{max}.",
        sumMin:"The sum of the values must be greater than #{min}.",

        // Radio validator messages:
        radioChecked:"The selected value is not valid.",
        
        generic:"Invalid."
    }

    this.validateField = function(field, value) {
		var input = $("#"+field.id);
		if(field.type==Field.CHOICE) {
			input = input.next();
		}

        if (value == undefined) {
            if (field.type==Field.MULTI_CHOICE || field.type==Field.GROUPED_MULTI_CHOICE) {
                var valset = input.val();
                if (!valset || valset.length == 0)  {
                    value = "";
                } else {
                    for (var i=0; i<valset.length; i++) {
                        var msg = this.validateField(field, valset[i]);
                        if (msg !== "")
                            return msg;
                    }
                }
            } else {
		      var value = input.val().trim();
            }
        }

        if(value=="") {
    		if(field.required) {
    			return field.name + ' is required';
    		} else {
                return "";
            }
        }

		if(field.validation) {
			if(!field.validation(value)) {
                if(field.tip) {
                    console.log("field.tip: " + field.tip);
				    return field.tip;
                } else if(messages[field.type]) {
                    var message = format(messages[field.type], {field:field.name});
                    console.log("message: " + message)
                    return message;
                } else {
                    return "Invalid";
                }
			}
		}/*else if(field.type==Field.RANGE) {
            //rangeRegex = new RegExp('(^[\\d]+-[\\d]+$)|(^[\\d]+-$)|(^-[\\d]+$)|(^[\\d]+$)');
            field.input.match(rangeRegex, field.tip);
            var rangeValid = Field.rangeMinMaxValidation(field.input.val());
            field.input.assert(rangeValid, ["The second value should be greater than first"] );
            //field.input.assert(Field.rangeValidation(field.input.val()), [field.tip ] );
        } */ else {
            var rule = patterns[field.type];
            //console.log("rule for " + field.type + " is " + rule);
            if(rule && !rule.test(value)) {
                if(field.tip) {
                    console.log("field.tip: " + field.tip);
                    return field.tip;
                } else if(messages[field.type]) {
                    var message = format(messages[field.type], {field:field.name});
                    console.log("message: " + message)
                    return message;
                } else {
                    return "Invalid";
                }
            }
        }

/*
         else if(field.type==Field.NUMBER || field.type==Field.INTEGER
				|| field.type==Field.EMAIL || field.type==Field.URL) {
			//user match() as implemented by validity.js to validate these
			this.match(value, field.type, field.tip);
		}else if(field.type==Field.DATE) {
			//dateRegex = new RegExp('^(\\d\\d\\d\\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$)');
			field.input.match(dateRegex, field.tip);
		}else if(field.type==Field.DURATION) {
			//durationRegex = new RegExp( 
			//	'^(-)?P(?:(\\d+)Y)?(?:(\\d+)M)?(?:(\\d+)D)?' + 
			//	'(T(?:(\\d+)H)?(?:(\\d+)M)?(?:(\\d+(?:\\.\\d+)?)S)?)?$');
			field.input.match(durationRegex, field.tip);
			//field.input.assert(Field.durationValidation(field.input.val()), [field.tip ] );
		//}else if(field.type==Field.URI) {
		//	field.input.assert(Field.uriValidation(field.input.val()), [field.tip ] );
		}
        */

        return "";
	}
    // Using the associative array supplied as the 'obj' argument, replace tokens 
    // of the format #{<key>} in the 'str' argument with that key's value.
    function format(str, obj) {
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str = str.replace(
                    new RegExp("#\\{" + p + "\\}", "g"), 
                    obj[p]
                );
            }
        }
        return str;
    }
}