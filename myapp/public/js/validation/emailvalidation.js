$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid name");

    jQuery.validator.addMethod("noSpace", function(value, element) { 
      return value == '' || value.trim().length != 0;
    }, "Only Space are not allowed");

    jQuery.validator.addMethod("ck_edit", function(value, element) { 
      return CKEDITOR.instances['email_message'].getData().replace(/<[^>]*>/gi, '').length != 0;
    }, "Please enter email message");

    

	$("form[name='emails_form']").validate({
        ignore: [],
		rules:{
			email_name:{
				required:true,
                noSpace:true,
			},
            email_subject:{
                required:true,
                noSpace:true,
            },
            email_message:{
                ck_edit:true,
                //required:true,
            },
		},
		//
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
            else if (element.parents('div').hasClass('ck_editerror') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
		//
		messages:{
			email_name:{
				required:"Please enter email name",
			},
            email_subject:{
                required:"Please enter email subject",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});

    $("form[name='updateemails_form']").validate({
        ignore: [],
        rules:{
            email_name:{
                required:true,
                noSpace:true,
            },
            email_subject:{
                required:true,
                noSpace:true,
            },
            email_message:{
                ck_edit:true,
                //required:true,
            },
        },
        //
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
            else if (element.parents('div').hasClass('ck_editerror') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                error.insertAfter(element);
            }
        },
        //
        messages:{
            email_name:{
                required:"Please enter email name",
            },
            email_subject:{
                required:"Please enter email subject",
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });
});