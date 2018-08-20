$(function(){

	$.validator.addMethod("alpha",function(value,element){
		return this.optional(element) || /^[a-zA-Z]+$/.test(value);
	},"Please enter a valid name")

	$.validator.addMethod("email",function(value,element){
        return this.optional(element) || /^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i.test(value);
	},"Please enter a valid e-mail address")

	$.validator.addMethod("pass",function(value,element){
		return this.optional(element) || /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/.test(value);
	},"Please enter valid password")

    $.validator.addMethod("noSpace", function (value, element) {
        return value.indexOf(" ") < 0 && value != ""; 
    });

	$("form[name='userprofileform']").validate({
		rules:{
			first_name:{
				required:true,
				alpha:true,
                normalizer: function(value) {return $.trim(value);}
			},
			last_name:{
				required:true,
				alpha:true,
                normalizer: function(value) {return $.trim(value);}
			},
			contact_number:{
                digits: true,
                min:1,
                minlength: 10,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
			},
            gender:{
                required: true,
                normalizer: function(value) {return $.trim(value);}
            },
			address1:{
                normalizer: function(value) {return $.trim(value);}
			},
			address2:{
                normalizer: function(value) {return $.trim(value);}
			},
            area:{
                normalizer: function(value) {return $.trim(value);}
            },
			city_name:{
                normalizer: function(value) {return $.trim(value);}
			},
			country_name:{
                normalizer: function(value) {return $.trim(value);}
			},
            ethnicity:{
                normalizer: function(value) {return $.trim(value);}
            },
            tag_line:{
                normalizer: function(value) {return $.trim(value);}
            },
			post_code:{
				//digits: true,
                //min:1,
                minlength: 3,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
			},
		},
		highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
            $(element).addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
            $(element).removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            }
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else if (element.parents('div').hasClass('choice')){
                error.appendTo( element.parent().parent().parent().parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		messages:{
			first_name:{
				required:"Please enter first name",
                alpha:"The first name may only contain letters."
			},
			last_name:{
				required:"Please enter last name",
                alpha:"The last name may only contain letters."
			},
            gender:{
                required: "Please select gender."
            },
            contact_number:{
                digits: "Enter only digits",
                min: "Please enter valid contact number",
                minlength: jQuery.validator.format("At least {0} digit required"),
                maxlength: jQuery.validator.format("Maximum {0} digit allowed"),
            },
            post_code:{
                minlength: "Please enter valid post code.",
                maxlength: "Please enter valid post code.",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});


	$("form[name='businessprofileform']").validate({
		rules:{
			first_name:{
				required:true,
				alpha:true,
                normalizer: function(value) {return $.trim(value);}
			},
			last_name:{
				required:true,
				alpha:true,
                normalizer: function(value) {return $.trim(value);}
			},
            gender:{
                required: true,
                normalizer: function(value) {return $.trim(value);}
            },
			contact_number:{
				required:true,
                digits: true,
                min:1,
                minlength: 10,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
			},
			address1:{
				required:true,
                normalizer: function(value) {return $.trim(value);}
			},
			address2:{
				required:true,
                normalizer: function(value) {return $.trim(value);}
			},
            area:{
                required:true,
                normalizer: function(value) {return $.trim(value);}
            },
			city_name:{
                normalizer: function(value) {return $.trim(value);}
			},
			country_name:{
                normalizer: function(value) {return $.trim(value);}
			},
            ethnicity:{
                normalizer: function(value) {return $.trim(value);}
            },
            tag_line:{
                normalizer: function(value) {return $.trim(value);}
            },
			post_code:{
                required:true,
				//digits: true,
                minlength: 3,
                maxlength: 15,
                normalizer: function(value) {return $.trim(value);}
			},
		},
		highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
            $(element).addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
            $(element).removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            }
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else if (element.parents('div').hasClass('choice')){
                error.appendTo( element.parent().parent().parent().parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		messages:{
			first_name:{
				required:"Please enter first name",
                alpha:"The first name may only contain letters."
			},
			last_name:{
				required:"Please enter last name",
                alpha:"The last name may only contain letters."
			},
            gender:{
                required: "Please select gender."
            },
			address1:{
                required:"Please enter address",
            },
            address2:{
                required:"Please enter address",
            },
            area:{
                required:"Please enter area",
            },
            contact_number:{
                required:"Please enter contact number",
                digits: "Enter only digits",
                min: "Please enter valid contact number",
                minlength: jQuery.validator.format("At least {0} digit required"),
                maxlength: jQuery.validator.format("Maximum {0} digit allowed"),
            },
            post_code:{
                required:"Please enter post code",
                minlength: "Please enter valid post code.",
                maxlength: "Please enter valid post code.",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});
});