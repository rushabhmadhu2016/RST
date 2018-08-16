$(function(){
	$.validator.addMethod("alpha", function(value, element) {
        return this.optional(element) || value == value.match(/^[a-zA-Z][\sa-zA-Z]*/);
    },"Please enter valid category name");

    jQuery.validator.addMethod("noSpace", function(value, element) { 
      return value == '' || value.trim().length != 0;
    }, "Only Space are not allowed");

    jQuery.validator.addMethod("ck_edit", function(value, element) { 
      return CKEDITOR.instances['blog_content'].getData().replace(/<[^>]*>/gi, '').length != 0;
    }, "Please enter blog content");

    

	$("form[name='blogs_form']").validate({
        ignore: [],
		rules:{
			blog_title:{
				required:true,
                noSpace:true,
			},
            blog_image:{
                //required:true,
                accept:"image/*",
                //extension: "jpeg|png|jpg",
            },
            blog_content:{
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
			blog_title:{
				required:"Please enter blog title",
			},
            blog_image:{
                required:"Blog Image is required",
                accept:"Please upload valid image",
            },
            blog_content:{
                required:"Post Content required",
            },
		},
		submitHandler:function(form){
			form.submit();
		}
	});

    $("form[name='updateblogs_form']").validate({
        ignore: [],
        rules:{
            blog_title:{
                required:true,
                noSpace:true,
            },
            blog_image:{
                //required:true,
                accept:"image/*",
                //extension: "jpeg|png|jpg",
            },
            blog_content:{
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
            blog_title:{
                required:"Please enter blog title",
            },
            blog_image:{
                required:"Blog Image is required",
                accept:"Please upload valid image",
            },
            blog_content:{
                required:"Post Content required",
            },
        },
        submitHandler:function(form){
            form.submit();
        }
    });
});