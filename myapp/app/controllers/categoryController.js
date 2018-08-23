
var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var models      = require('../../app/models/revstance_models');
var User = models.User;
var Category = models.Category;
var Properties = models.Property;


//#static pages
exports.addCategoryPage = function(req, res) {
	res.render('admin/addcategory', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session,
		categories:'',
	});
}

/*Delete Category From Admin Side*/
exports.deleteCategoryPage = function(req, res) {
	cat_id = req.param('delete');
	console.log(cat_id);
	
	//Properties.findOne({'category_id':cat_id}, function(err, ci){
	Properties.find({'category_id':{ "$regex": cat_id, "$options": "i" }}, function(err, ci){
		var status=0;
		if(ci){
			ci.forEach(function(category){
				var cat_array = (category.category_id).split();
				cat_array.forEach(function(cat){
					if(cat==cat_id){
						status++;
					}
				});
			});
		}
		if(status==0){
			Category.deleteOne({ 'id' :  cat_id}, function(err){
			 		req.flash('success', 'Category deleted successfully');
	         	res.redirect('/admin/categories');
			});
		}
		else{
			req.flash('error', 'Oops.. Category linked with locations');
    		res.redirect('/admin/categories');
		}
	});
}


/*Edit Category From Admin Side*/
exports.editCategoryPage = function(req, res) {
		var category_id = req.param('edit');
		Category.findOne({ 'id' :  category_id}, function(err, category_name){
			if(err){
				req.flash('error', 'Error : something is wrong while edit category');
				res.redirect('/errorpage');
			}else{				
	    		console.log(category_name);
	    		res.render('admin/addcategory', {
					error : req.flash("error"),
					success: req.flash("success"),
					session:req.session,
					categories:category_name,
				});
			}
   	});
}

/*Store New Category From Admin Side*/
exports.storeCategoryPage = function(req, res) {
		cat_name = (req.body.category_name).toLowerCase();
		Category.findOne({ 'category_name' :  cat_name}, function(err, category_name) {

			if(err){
				req.flash('error', 'Error : something is wrong while add category');
				res.redirect('/errorpage');
			}
			else{
				if (category_name) {
	        		console.log('category already exitst');
			        req.flash('error', 'Category already exist');
					res.redirect('/admin/categories');
		    	} else {
		    		Category.find().sort([['id', 'descending']]).limit(1).exec(function(err, categorydata) {

		    		var newCategory = new Category();
					//var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
					var day = getDate();
					newCategory.category_name = cat_name;
				    newCategory.status = parseInt(1);
				    newCategory.created_date = day;
				    newCategory.updated_date = day;
				    if(categorydata.length > 0){
				    	newCategory.id = categorydata[0].id+1;
				    }else{
				    	newCategory.id = 1;
				    }
				    newCategory.save(function(err) {
			        if (err)  return (err);			       
			        	req.flash('success', 'Category added successfully.');
			        	res.redirect('/admin/categories');
			    	});
		    	  }); 
		    	}
			}        	
		});
}
/*Store New Category From User Side*/
exports.storeUserCategoryPage = function(req, res) {
		cat_name = (req.body.category_name).toLowerCase();
		Category.findOne({ 'category_name' :  cat_name}, function(err, category_name) {

			if(err){
				res.send({'status' : 'false', 'message' : 'something is wrong while adding category', 'data': null});
			}
			else{
				if (category_name) {
					res.send({'status' : 'false', 'message' : 'Category Already Exists', 'data': null});
		    	} else {
		    		Category.find().sort([['id', 'descending']]).limit(1).exec(function(err, categorydata) {

		    		var newCategory = new Category();
					//var day =dateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss");
					var day = getDate();
					newCategory.category_name = cat_name;
				    newCategory.status = parseInt(0);
				    newCategory.created_date = day;
				    newCategory.created_by = req.session.user.id;
				    newCategory.updated_date = day;
				    if(categorydata.length > 0){
				    	newCategory.id = categorydata[0].id+1;
				    }else{
				    	newCategory.id = 1;
				    }
				    newCategory.save(function(err) {
			        if (err)  return (err);	
			        	res.send({'status' : 'true', 'message' : 'Category Added Successfully. it will be display after admin approval', 'data': null});
			    	});
		    	  }); 
		    	}
			}        	
		});
}

/*Update Category From Admin Side*/
exports.updateCategoryPage = function(req, res) {
 	Category.findOne({id:req.body.category_id}, function(err, p) {
 		if(err){
			req.flash('error', 'Error : something is wrong while updating category');
			res.redirect('/errorpage');
		}
		else{
			console.log('test');
			if (!p){
            req.flash('error', 'Category Not Found..');
        	}
	        else 
	        {   
	        	console.log('test1');
	        	var existing = p.category_name;
	        	if(existing!=req.body.category_name)
	        	{
	        		Category.findOne({category_name:req.body.category_name}, function(err, category) {
	        			if (category){
	        				req.flash('error', 'Category already exist');
	                		res.redirect('/admin/categories');
	        			}
	        			else{
	        				console.log('test2');
	        				Category.findOne({id:req.body.category_id}, function(err, cate) {
	        					if(err){
									req.flash('success', 'Oops. Something went wrong..');
							        console.log('error');
	        					}else{
	        						console.log('test3');
	        						cate.category_name = req.body.category_name;
				            		cate.save(function(result) {
						                if (result){
							                req.flash('success', 'Oops. Something went wrong..');
							                console.log('error');
						           		}
					            		else
					            		{
					                		req.flash('success', 'Category updated successfully.');
					                		console.log('success');
					                		res.redirect('/admin/categories');
					                	}
				                	});
				            	}
				        	});
				        }
        			})
        		}else{
        			req.flash('success', 'Category updated successfully.');
					 res.redirect('/admin/categories');
        		}
        	}
        }    		      
	}); 	
}

exports.acceptCategoryPage = function(req,res) {
	cat_id = req.query.id;

	Category.findOne({id:cat_id}, function(err, category) {
 		if(err){
 			req.flash('error', 'Error : something is wrong while fetching category list');
			res.redirect('/errorpage');
		}
		else{
			if (category){
				category.status = 1;
				category.save(function(err) {
	                if (err){
	                	req.flash('error', 'Error : something is wrong while accepting category request');
						res.redirect('/errorpage');
	           		}
            		else
            		{
            			req.flash('success', 'Category request accepted.');
	         			res.redirect('/admin/categories');
                	}
                });
			}
		}
	});

}

exports.rejectCategoryPage = function(req,res) {
	cat_id = req.query.id;

	Category.findOne({id:cat_id}, function(err, category) {
 		if(err){
 			req.flash('error', 'Error : something is wrong while fetching category list');
			res.redirect('/errorpage');
		}
		else{
			if (category){
	            Category.deleteOne({ 'id' :  cat_id}, function(err){
				 	req.flash('success', 'Category request rejected successfully');
		         	res.redirect('/admin/categories');
				});
			}
		}
	});
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }


    
