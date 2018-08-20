var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var thumb 		= require('node-thumbnail').thumb;
var models      = require('../../app/models/revstance_models');
var Properties  = models.Property;
var Category    = models.Category;
var Reviews     = models.Review;
var User 		= models.User;
var Claims 		= models.Claim;
var fs  		= require('fs');
var randomstring = require("randomstring");
var FlaggedReview= models.Flag;

exports.isLoggedIn = function(req, res, next){
	if (req.session.user && req.session.user.user_type==2) { // req.session.passport._id
		next();
	} else {
		res.redirect('/');
	}
}

exports.userCheck = function(req, res, next){
	if (req.session.user) {
		next();
	} else {
		res.redirect('/');
	}
}

exports.showBusinessHomePage = function(req, res) {
	res.render('listing/businesshome.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session
	 });	 
}

exports.claimProperty = function(req, res) {
	if(req.session.user){
		if(req.session.user.user_type==2){
			if(req.query.id){
				Properties.findOne({id:req.query.id}, function(err, property){
					if(err){
						req.flash('error', 'Invalid param in location claim');
						res.redirect('/errorpage');
					}
					if(property==null){
						req.flash('error', 'Invalid param in location claim');
						res.redirect('/errorpage');
					}
					Claims.find({user:req.session.user.id, property:req.query.id}, function(err, data){
						if(err){
							req.flash('error', 'Something is wrong');
							res.redirect('/errorpage');		
						}
						console.log(data);
						if(data.length>0){							
							req.flash('success', 'Location already claimed');
							res.redirect('/myclaimedlocations');
						}else{
						Claims.find().sort([['id', 'descending']]).limit(1).exec(function(err, data) {
						if(err){
							console.log(err);	
						}
						var claim = new Claims();
						if(data==null){
						claim.id=1;							
						}else if(data.length==0){
						claim.id=1;
						}else{
							claim.id=data[0].id+1;
						}
						claim.user=req.session.user.id;
						claim.property=req.query.id;
						claim.status = 0;
						claim.created_date=getDate();
						claim.save(function(err){
							if(err){
								req.flash('error', 'Claim failed');
								res.redirect('/errorpage');
							}
							req.flash('success', 'Location claimed successfully');
							res.redirect('/myclaimedlocations');
						});
					});
					}
					});
				});
			}
		}
	}
}

exports.unclaimProperty = function(req, res) {
	if(req.session.user){
		if(req.session.user.user_type==2){
			if(req.query.id){
				Claims.find({user: req.session.user.id, id:req.query.id}).remove().exec(function(err){
					if(err){
						req.flash('error', 'Claim failed');
						res.redirect('/errorpage');
					}
					req.flash('success', 'Location unclaimed successfully');
					res.redirect('myclaimedlocations');
				});
			}
		}
	}
}

exports.showMyListingPage = function(req, res) {
	var keyword='';
	var category='';
	if(req.query.keyword)
	{
		keyword=req.query.keyword.trim().toLowerCase();
	}
	if(req.query.category)
	{
		category=req.query.category;
	}
	var filter={};
	var claimStatus = 0;
	var otherClaimStatus = 0;
	if(req.session.user){
		userId = req.session.user.id;
	}
	var propertyIds = [];
	var userIds = [];
	var reviewsList = [];
	var searchedProperties = [];
	var page = 0;
	var perPage = 5;
	var categoriesList = [];
	var propertyList = [];
	var usersList = [];
	var categoriesListToSearch = [];
	filter.keyword=keyword;
	filter.category=category;	
	if(req.query.page){
		if(IsNumeric(req.query.page)){
			page = req.query.page;
		}else{
			req.flash('error', 'Invalid param page in Location search');
			res.redirect('/errorpage');
		}
	}
	if(req.query.category){
		filter.category_filter=req.query.category;
		categoriesListToSearch = {'id': req.query.category};
	}else{
		filter.category_filter='';
		categoriesListToSearch = {};
	}

	var counter = 0;
	Category.find({}, function(err, categories) {
  		if(err){
	  		req.flash('error', 'Error : something is wrong in property search');
			res.redirect('/errorpage');
  		}  	
  		categories.forEach(function(category) {
  			categoriesList[category.id]=category;
  		}); 		
		Properties.count({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{ area:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, {user_id:req.session.user.id}, categoriesListToSearch]}, function(err, c) {
		counter = c;//
		console.log("Total Counter = "+c);
		Properties.find({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{ area:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, {user_id:req.session.user.id}, categoriesListToSearch]}).limit(perPage).skip(perPage * page)
    .sort({ property_name: 'asc'}).exec(function(err, properties) {  	
    	if(err){
	  		req.flash('error', 'Error : something is wrong in property search');
			res.redirect('/errorpage');
	  	}
	  	console.log("Total Property Counter = "+properties.length);
	  	properties.forEach(function(property) {
	      userIds.push(property.user);
	      propertyIds.push(property.id);
	    });
	    User.find({'id': {$in: userIds } }, function(err, users) {
	    	if(err){
		  		req.flash('error', 'Error : something is wrong in property search');
				res.redirect('/errorpage');
	  		}
	  		users.forEach(function(user){
				usersList[user.id]=user;
	  		});
	  		console.log("Total Users Counter = "+properties.length);
	  		Reviews.find({'id':{$in: propertyIds}}, function(err, reviews) {
	  			reviews.forEach(function(review){
	  				reviewsList.push(review);
	  			});
	  			console.log("Total Review Counter = "+reviews.length);

		  			var claimDataProperies = [];
			    	Claims.find({}, function(err, claimData) {
			    		if(err){
			    			req.flash('error', 'Error : something is wrong in property search');
							res.redirect('/errorpage');
			    		}
			    		claimData.forEach(function(claim){
			    			claimDataProperies.push(claim.property);
			    		})
	  					properties.forEach(function(property) {
		  					var propertyItem = {};
		  					propertyItem.id = property.id;
		  					propertyItem.property_name = property.property_name;
		  					//propertyItem.category_id = property.category;
		  					// propertyItem.category = categoriesList[property.category_id].category_name;
		  					propertyItem.category = getCategoryName(property.category,categoriesList);
		  					propertyItem.user = property.user;
		  					propertyItem.property_image = property.property_images;
		  					propertyItem.property_desc = property.property_desc;
		  					propertyItem.property_status = property.status;
		  					propertyItem.address1 = property.address1;
		  					propertyItem.address2 = property.address2;
		  					propertyItem.area = property.area;
		  					propertyItem.post_code = property.post_code;

		  					propertyItem.review_count = getPropertyReviewCount(property.id, reviewsList);
		  					propertyItem.average_rating = getPropertyAverageRating(property.id, reviewsList);
		  					propertyItem.is_claimed = checkIsClaimedProperty(property.id, claimDataProperies);
		  					searchedProperties.push(propertyItem);
					    });
					    /*console.log(searchedProperties);
					    res.send("welcome");*/
				   		res.render('listing/myListing', {
							error : req.flash("error"),
							success: req.flash("success"),
							session: req.session,
							properties: searchedProperties,
							categories: categoriesList,
							keyword: keyword,
							filters: filter,
							page: page,
							counter: counter,
						});					
				  	});
				});
			});
		});
	});
});
}

function checkIsClaimedProperty(id, list){
		list.forEach(function(nid){
			if(id==nid) return true;
		});
		return false;
}

exports.postReplyPage = function(req, res) {
	console.log(req.body);
	Reviews.find({'id': req.body.reply_reviewid,'property_id':req.body.propertyId},function(err,review){
		if(err){
			res.send({'status':false});
		}else{
			var day = getDate();
			if(review){
        	Reviews.updateOne({'id': req.body.reply_reviewid,'property_id':req.body.propertyId},{ $set:{'is_reply': 1,reply_text:req.body.review_reply,reply_created_date:day}},function(err,done){
            	if (err){
            		res.send({'status':false});
            	}
				res.send({'status':true});
              });
    		}
		}
	})
}

exports.showPropertyListingPage = function(req, res) {
	var id = req.param('property');
	console.log('propery_id'+id);
    Properties.find({id:id,user_id: req.session.user.id}, function(err, c) {
    	if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}else{
			var propertyList = [];      
		    c.forEach(function(user) {
		      propertyList.push(user);
			});
			//
			Reviews.find({property_id:id},function(err,r){
				var reviewsUserIds = [];
				if(err){
					req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
				}else{
						// console.log(id);
					var reviewList = [];      
				    r.forEach(function(rev) {
				      reviewList.push(rev);
				      reviewsUserIds.push(rev.user_id);
					});
					console.log("Review User");
				    console.log(reviewsUserIds);
					var reviewUsersList = [];
					User.find({'id':{ $in: reviewsUserIds }}, function(err, reviewUsers){
						if(err){
							console.log("Errror");
						}
						reviewUsers.forEach(function(ruser){
							reviewUsersList[ruser.id]=ruser;
							console.log(ruser);
						});						
						 res.render('listing/detailListing.ejs', {
						    error : req.flash("error"),
						    success: req.flash("success"),
						    session:req.session,
						    properties: propertyList,
						    reviews: reviewList,
						    reviewUsersList: reviewUsersList,
					    });
					});
				}
			});
		}
 	});     
}

exports.showCreateListingPage = function(req, res) {
	Category.find({}, function(err, c) {
		if(err){
			req.flash('error', 'Error : something is wrong in create listing');
			res.redirect('/errorpage');
		}else{
			var categoryList = [];	    
		    c.forEach(function(user) {
		      categoryList.push(user);
		    });
		    console.log("categories"+categoryList);
		    res.render('listing/addListing.ejs', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session,
				categories: categoryList,
		 	})
		}
	});
}

exports.deletePropertyListingPage = function(req,res){		
	var id = req.param('property');	
	console.log("deleted");

	Properties.findOne({id:id,user_id: req.session.user.id}, function(err, property) {
		var del_images = property.property_images.split(",");
		
		Properties.deleteOne({ 'id' :  id}, function(err){
		console.log('Location deleted');

		if((property.property_images.length)!=0){
			for (var i = 0; i < del_images.length; i++) {
				console.log("Image Name :"+del_images[i]);

				if(fs.existsSync('public/uploads/'+del_images[i])){
					fs.unlink('public/uploads/'+del_images[i], (err) => {
					if (err){
					  	console.log('file delete error');
					  }
					  else{
					  	console.log('File deleted!');
					  }
					});
				}

				if(fs.existsSync('public/uploads/thumbs/thumb_'+del_images[i])){
					fs.unlink('public/uploads/thumbs/thumb_'+del_images[i], (err) => {
					if (err){
					  	console.log('file delete error');
					  }else{
						console.log('File deleted!');
					  }
					});
				}
			}
		}
		

		Claims.deleteMany({ 'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Claims deleted');			
		});

		Reviews.deleteMany({ 'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Review deleted');			
		});

		FlaggedReview.deleteMany({'property_id' :  id}, function(err){
			if(err){
				console.log('err');
			}
			console.log('Review deleted');			
		});

	 	req.flash('success', 'Location deleted successfully');
     	res.redirect('/myListing');
	});	
			
	});
	
}

exports.editPropertyListingPage = function(req, res) {
	var id = req.param('property');
	console.log('propery_id'+id);

   Properties.find({id:id,user_id: req.session.user.id}, function(err, property) {
    	if(err){
    		console.log(property);
			req.flash('error', 'Error : something is wrong in location');
			res.redirect('/errorpage');
		}else{
			var propertyList = [];      
		    property.forEach(function(prop) {
		      propertyList.push(prop);
			});
		    console.log(propertyList.length);
			Category.find({}, function(err, category) {
				if(err){
					req.flash('error', 'Error : something is wrong in edit listing');
					res.redirect('/errorpage');
				}else{
					var categoryList = [];	    
				    category.forEach(function(cat) {
				      categoryList.push(cat);
				    });
				    //console.log("categories"+categoryList);
				    res.render('listing/editListing.ejs', {
						error : req.flash("error"),
						success: req.flash("success"),
						session:req.session,
						properties: propertyList,
						categories: categoryList,
				 	})
				}
			});
		}
	});
	
}

exports.storePropertyListing = function(req, res) {
	if(req.body.property_name.length!=0 && req.body.categories!=undefined){

	Properties.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),address1: new RegExp('^' +req.body.address1.trim() + '$', 'i'),address2: new RegExp('^' +req.body.address2.trim() + '$', 'i'),area: new RegExp('^' +req.body.area.trim() + '$', 'i'),post_code: new RegExp('^' +req.body.postcode.trim() + '$', 'i')}, function(err, property) {
	
	//Properties.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),address1: new RegExp('^' +req.body.address1.trim() + '$', 'i'),address2: new RegExp('^' +req.body.address2.trim() + '$', 'i'),'category_id': parseInt(req.body.categories)}, function(err, property) {

	//Properties.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),'category_id': parseInt(req.body.categories)}, function(err, property) {
	
	//Properties.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i')}, function(err, property) {	
	if(err){
		req.flash('error','Error : something is wrong while store Location');
		res.redirect('/errorpage');
	}else{
		if(property.length>0){

			uploaded = req.files.map(function(value) {
				return value.filename;
			});

			uploaded_files = uploaded.join();
			var arr = uploaded_files.split(',');
			for (var i = 0; i < arr.length; i++) {
				console.log('public/uploads/'+arr[i]);
				if(fs.existsSync('public/uploads/'+arr[i])){
				    fs.unlink('public/uploads/'+arr[i], (err) => {
					  if (err){
					  	console.log('File delete error');
					  }else{
					  	console.log('File deleted!');
					  }
					});
				}
			}

			req.flash('error','Error : Location already exist in our system.');
			backURL=req.header('Referer') || '/';  			
  			res.redirect(backURL);	
		  
		} else {
			
			console.log('new property');

			if(req.files && (req.files.length<=10)){
		 	//console.log('uploading File...')
		    var uploaded_files;

		    uploaded = req.files.map(function(value) {
				return value.filename;
			});
			uploaded_files = uploaded.join();

			uploaded.map(function(a){
				generateThumb('public/uploads/'+a, '345px', 'thumb_', 'public/uploads/thumbs');
			})

		    console.log(uploaded_files);

		    Properties.find().sort([['id', 'descending']]).limit(1).exec(function(err, propertydata) { 
			console.log(req.body.categories);

			var newProperty = new Properties();
			var day = getDate();

		    if(propertydata.length>0){		    	
		    	newProperty.id = propertydata[0].id+1;
		    }else{
		    	newProperty.id = 1;
		    }
			newProperty.property_name = req.body.property_name.trim();
		    newProperty.address1 = req.body.address1.trim();
		    newProperty.address2 = req.body.address2.trim();
		    newProperty.area = req.body.area.trim();
		    newProperty.post_code = req.body.postcode;
			newProperty.category = req.body.categories;
		    newProperty.property_desc = req.body.property_desc;
		    newProperty.property_images = uploaded_files;
		    newProperty.user = req.session.user._id;
		    newProperty.bounty = property.bounty;
		    newProperty.created_by = req.session.user.user_type;
		    newProperty.status = 0;
		    newProperty.is_claimed = 0;
		    newProperty.created_date = day;
		    newProperty.updated_date = day;
		    
			    newProperty.save(function(err) {
			        if(err){
			        	console.log('save error');
			        	console.log(err);
						req.flash('error', 'Error : something is wrong while add business user');
						res.redirect('/errorpage');
					}else{

		    			User.findOne({id:req.session.user.id}, function(err, updatePropertyData) {
		    			//console.log(updatePropertyData);
		    			//process.exit();
		    			updatePropertyData.property = newProperty._id;
		    			updatePropertyData.category = newProperty.category;
		    			
		    			updatePropertyData.save(function (err) {
		    			if(err){
							req.flash('error', 'Error : something is wrong');
							res.redirect('/errorpage');
						}else{
							console.log('User Properties Added..');
						}
					});
					});
		    			Category.findOne({id: newProperty.category}, function(err, updateCategory) {
		    				console.log(newProperty.category);
		    				updateCategory.user = newProperty.user;
		    				updateCategory.property = newProperty._id;

		    				updateCategory.save(function(err) {
		    					if(err){
							req.flash('error', 'Error : something is wrong');
							res.redirect('/errorpage');
							}else{
								console.log('Category Properties Added..');
							}
		    				});
		    			});
			        		req.flash('success', 'Location request submitted successfully, it will be listed after admin approval.');
			        		res.redirect('/Mylisting');
					}
			      });
							 
		    });
			}
			else{
				console.log("submit without image upload");
				req.flash('error', 'You can upload maximum 10 images');
			    res.redirect('/addListing');
			}
		}
	}	
	});
	}else{
	req.flash('error', 'Oops Something went wrong');
	res.redirect('/Mylisting');
	}
}	

exports.showJoinListing = function(req, res){

	// let users = await User.findOne({'id': req.session.user.id}).populate('properties');
	// users.forEach(function(users){
	// 	console.log(users);
	// });
	User.findOne({'id': req.session.user.id}).populate('property').exec(function(err, user){
		if(err){
			console.log('Error');
		}
		console.log(user);
	});
}

exports.updatePropertyListing = function(req, res) {
	//console.log(req.files);
	//console.log(req.body);
	if(req.body.property_name.length!=0 && req.body.categories!=undefined){
		var merge_img;
		var update_merge;

	if(req.files){
		
		var uploaded_files;
	    uploaded = req.files.map(function(value) {
			return value.filename;
		})

		uploaded.map(function(a){
			generateThumb('public/uploads/'+a, '345px', 'thumb_', 'public/uploads/thumbs');
		})

		uploaded = uploaded.join();
		var uploaded_arr = uploaded.split(",");

		var exist_image =req.body.images;
		if(req.body.images!=undefined){
		var delete_prop_images = exist_image.join();
		}

		
		if(req.body.images==undefined && uploaded_arr.length==1 && uploaded_arr[0]==''){
			//console.log("undefined or blank");
			merge_img = [];
		}
		else if(uploaded_arr.length==1 && uploaded_arr[0]==''){
			var merge_img = req.body.images;
			//console.log("data");	
		}else if(req.body.images==undefined){
			merge_img = uploaded_arr;
		}else{
			merge_img = uploaded_arr.concat(req.body.images);
		}

		update_merge = merge_img.join();
		
	}
	console.log(req.body.property_id);
	Properties.findOne({ 'id' :  req.body.property_id }, function(err, prop) {	
	if(err){
		console.log("error"+err);
		req.flash('error','Error : something is wrong while update Location');
		res.redirect('/errorpage');
	}else{
		if (prop) {

			var db_property_id = prop.id;
			var db_property_name = prop.property_name;
			var db_address1 = prop.address1;
			var db_address2 = prop.address2;
			var db_categories = prop.category_id;
			var db_post_code = prop.post_code;
			var db_images = prop.property_images.split(",");

			if(req.body.images!=undefined){
				for (var i = 0; i < db_images.length; i++) {
					if((delete_prop_images.indexOf(db_images[i])) == (-1)){
						console.log(db_images[i]);


						if(fs.existsSync('public/uploads/'+db_images[i])){
							fs.unlink('public/uploads/'+db_images[i], (err) => {
								if (err){
							  	console.log('file delete error');
							  	}else{
							  	console.log('File deleted!');
							  	}
							});
						}

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_images[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_images[i], (err) => {
							if (err){
							  	console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}
					}
				}
			}
			else{
				if((prop.property_images.length)!=0){
					for (var i = 0; i < db_images.length; i++) {
						if(fs.existsSync('public/uploads/'+db_images[i])){
							fs.unlink('public/uploads/'+db_images[i], (err) => {
							if (err){
								console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_images[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_images[i], (err) => {
								if (err){
									console.log('file delete error');
							  	}else{
									console.log('File deleted!');
							  	}
							});
						}

					}
				}
			}
			

			//if(db_property_name==req.body.property_name.trim() && db_categories==req.body.categories)
			if(db_property_id==req.body.property_id && db_property_name==req.body.property_name.trim() && db_address1==req.body.address1.trim() && db_address2==req.body.address2.trim() && db_post_code==req.body.postcode.trim())
			{

			// if(db_property_name==req.body.property_name.trim())
			// {
				//
				Properties.findOne({id:req.body.property_id}, function(err, updateProperty) {
        					if(err){
								req.flash('success', 'Oops. Something went wrong while update listing');
						        console.log('error');
        					}else{

        						var day = getDate();
							    updateProperty.property_name = req.body.property_name.trim();
							    updateProperty.address1 = req.body.address1.trim();
							    updateProperty.address2 = req.body.address2.trim();
							    //updateProperty.category_id = req.body.categories;
							    updateProperty.category_id = req.body.categories;
							    updateProperty.property_desc = req.body.property_desc.trim();
							    updateProperty.property_images = update_merge;
							    updateProperty.post_code = req.body.city;
							    updateProperty.city = req.body.country;
							    updateProperty.country = req.body.postcode;
							    updateProperty.updated_date = day;
							    updateProperty.save(function(err) {
					                if (err){
						                req.flash('error', 'Oops. Something went wrong..');
						                console.log('error');
					           		}
				            		else
				            		{				            			
				                		req.flash('success', 'Location updated successfully.');
				                		console.log('same value success');
				                		res.redirect('/myListing');
				                	}
					            });
			            	}
			        	});
			}
			else{

				//Properties.findOne({ 'property_name': new RegExp('^' +req.body.property_name.trim() + '$', 'i'),'category_id': req.body.categories }, function(err, property) {

				Properties.find({property_name: new RegExp('^' +req.body.property_name.trim() + '$', 'i'),address1: new RegExp('^' +req.body.address1.trim() + '$', 'i'),address2: new RegExp('^' +req.body.address2.trim() + '$', 'i'),post_code: new RegExp('^' +req.body.postcode.trim() + '$', 'i')}, function(err, property) {

				//Properties.findOne({ 'property_name': new RegExp('^' +req.body.property_name.trim() + '$', 'i')}, function(err, property) {
        			if (property.length>0){
        				console.log("Property data"+property.length);
        				req.flash('error', 'Location already exists');
                		res.redirect('/myListing');
        			}
        			else{
        				Properties.findOne({id:req.body.property_id}, function(err, updateProperty) {
        					if(err){
								req.flash('success', 'Oops. Something went wrong while update listing');
						        console.log('error');
        					}else{
        						var day = getDate();
							    updateProperty.property_name = req.body.property_name.trim();
							    updateProperty.address1 = req.body.address1.trim();
							    updateProperty.address2 = req.body.address2.trim();
							    //updateProperty.category_id = req.body.categories;
							    updateProperty.category_id = req.body.categories;
							    updateProperty.property_desc = req.body.property_desc.trim();
							    updateProperty.property_images = update_merge;
							    updateProperty.updated_date = day;
							    updateProperty.post_code = req.body.postcode;
							    updateProperty.city = req.body.city;
							    updateProperty.country = req.body.country;
							    updateProperty.save(function(err) {
				                if (err){
					                req.flash('error', 'Oops. Something went wrong..');
					           	}
				            	else
				            	{
				                	req.flash('success', 'Location updated successfully.');
				                	console.log('success');
				                	res.redirect('/myListing');
				                }
					            });
			            	}
			        	});
        			}
				});
			}			
			} 
		}	
	});
	}
	else{
		req.flash('error', 'Oops. Something went wrong..');
		res.redirect('/myListing');
	}
		
}

exports.showClaimPendingProperties = function(req, res) {
	propertyIds = [];
	reviewsList = [];
	claimedProperties = [];
	categoriesList = [];
	propertiesList = [];
	var page=0;
	var counter = 0;
	var perPage = 10;

	if(req.query.page){
		var isnum = /^\d+$/.test(req.query.page);
		if(isnum) page=req.query.page;
	}
	Claims.find({user_id: req.session.user.id}, function(err, claimProperties){		
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		if(claimProperties == null){
			counter =0;
		}else{
			counter = claimProperties.length;
		}
		Claims.find({user_id: req.session.user.id}).limit(perPage).skip(perPage * page).exec(function(err, claimedPropertiesData) {
			claimedPropertiesData.forEach(function(claimproperty){
				propertyIds.push(claimproperty.property_id);
			});	
		console.log("You have Claimed "+claimProperties.length);
		console.log("Property Ids "+propertyIds);
		Properties.find({id: {$in: propertyIds } }, function(err, properties) {
	    	if(err){	    		
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
			}

			properties.forEach(function(pr){
				propertiesList[pr.id]=pr;
			});
			Reviews.find({'property_id': {$in: propertyIds } }, function(err, reviews) {
	  			if(err){
	  				req.flash('error', 'Error : something is wrong');
					res.redirect('/errorpage');
	  			}

	  			reviews.forEach(function(review){
	  				reviewsList.push(review);
	  			});

	  			Category.find({}, function(err, cats) {
			  		if(err){
				  		req.flash('error', 'Error : something is wrong in location search');
						res.redirect('/errorpage');
			  		}
			  		cats.forEach(function(category) {
			  			categoriesList[category.id]=category;
			  		});

	  			claimedPropertiesData.forEach(function(property) {
  					var propertyItem = {};
  					propertyItem.id = property.property_id;
  					propertyItem.claim_id = property.id;
  					propertyItem.property_name = propertiesList[property.property_id].property_name;
  					//propertyItem.category = categoriesList[propertiesList[property.property_id].category_id].category_name;
  					propertyItem.category = getCategoryName(propertiesList[property.property_id].category,categoriesList);
  					propertyItem.user_type = 1
  					propertyItem.user_id = property.user_id;
  					propertyItem.property_image = propertiesList[property.property_id].property_images;
  					propertyItem.property_status = propertiesList[property.property_id].status;
  					propertyItem.address1 = propertiesList[property.property_id].address1;
  					propertyItem.address2 = propertiesList[property.property_id].address2;
  					propertyItem.status = property.status;
  					propertyItem.city = propertiesList[property.property_id].city;
  					propertyItem.country = propertiesList[property.property_id].country;
  					propertyItem.post_code = propertiesList[property.property_id].post_code;
  					propertyItem.review_count = getPropertyReviewCount(property.property_id, reviews);
  					propertyItem.average_rating = getPropertyAverageRating(property.property_id, reviews);				      
  					claimedProperties.push(propertyItem);
  					console.log(propertyItem);	
			    });

				res.render('listing/myPendingClaimProperties.ejs', {
					error : req.flash("error"),
					success: req.flash("success"),
					session: req.session,
					properties: claimedProperties,
					page: page,
					counter: counter
				});
			  });
			});
  		});
		});
	});
}

function getDate(){ 
	return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

function getPropertyAverageRating(id, reviews){
	var counter = 0;
	var totcounter = 0;
	reviews.forEach(function(review){
		if(review.property==id){ counter+=review.review_rating; totcounter++;}
	});
	return isNaN(parseInt(counter/totcounter)) ? 0 : parseInt(counter/totcounter);
}

function getPropertyReviewCount(id, reviews){
	var counter = 0;
	reviews.forEach(function(review){
		if(review.property==id) counter++;
	});
	return counter;
}

function getCategoryName(id,catList){
	var catname = [];
	catList.forEach(function(cat){		
		if(id.indexOf(cat.id.toString()) == -1){
			//console.log("Not found");
		}else{
			catname.push(cat.category_name);		
		}
	});
	return catname.join();
}

function generateThumb(fileName, width, prefix, destinationFolder){

thumb({
  prefix: prefix, 
  suffix: '',
  source: fileName,
  destination: destinationFolder,
  concurrency: 1,
  overwrite: true,
  width:width
}, function (err, stdout, stderr) {
  	if(err) { return false;}else{return true;}
	});
}
