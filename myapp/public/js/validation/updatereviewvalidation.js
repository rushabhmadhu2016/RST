$(function(){

	$.validator.addMethod('editmaxfile', function (value, element, param) {
    return this.optional(element) || ((parseInt(element.files.length))+(parseInt($("#db_editreviewimages").val())) <= 10)
}, 'Maximum 10 review images are allowed');

	$("form[name='updateReviewform']").validate({
		rules:{
			review_desc:{
				required:true,
				normalizer: function(value) {return $.trim(value);}
			},
			star:{
				required:true,
			},
			editreview_images:{
				//required:true,
				editmaxfile:true,
				//extension: "jpeg|png|jpg",
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
            else if (element.parents('div').hasClass('has-feedback') || element.hasClass('select2-hidden-accessible')) {
                error.appendTo( element.parent() );
            }
            else {
                if(element.parents('div').hasClass('error_msg')){

                error.appendTo('.editreviewfilemargin');
            	}
            	else{   
                error.insertAfter(element);
                }
            }
        },
		//
		messages:{
			review_desc:{
				required:"Please enter review description",
			},
			star:{
				required:"Please select rating star",	
			},
			/*review_images:{
				required:"Please upload images",
			},*/
		}
		//submitHandler:function(form){
        //form.submit();
        //}
	});
});