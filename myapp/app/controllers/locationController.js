var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var mongoose = require ('mongoose');
var models      = require('../../app/models/revstance_models');
var dynamicmail  = require('../../app/controllers/dynamicMailController');
var User = models.User;
var Category = models.Category;
var Property = models.Property;
var Reviews  = models.Review;
var Claim 	 = models.Claim;

exports.getDetailLocation = function(req, res){
	var propertyDetails = {};
	var cat_array = [];
	var perPage = 5;
	var claimStatus = 0;
	if(req.query.page){
		page=req.query.page;
	}else{
		page=0;
	}
	conditions = {};			
	conditions['property_id']=req.query.id;	
	//console.log(req.query.id);
	Property.findOne({id:req.query.id}, function(err, property) {
		if (err){
			req.flash('error', 'Could not find location');
			res.redirect('/admin/locations');
		}
		//console.log(property);		
		if(req.query.page){
			page=req.query.page;
		}
		propertyDetails.id = req.query.id; 
		propertyDetails.property_name = property.property_name;
		propertyDetails.address1 = property.address1;
		propertyDetails.address2 = property.address2;
		propertyDetails.city = property.city;
		propertyDetails.country = property.country;
		propertyDetails.property_desc = property.property_desc;
		propertyDetails.user_id = property.user_id;
		propertyDetails.status = property.status;
		propertyDetails.created_date = property.created_date;
		propertyDetails.property_images = property.property_images;
		propertyDetails.property_images_count = property.property_images.split(',').length;
		propertyDetails.category_id = property.category_id;
		propertyDetails.post_code = property.post_code;
		console.log("Current property catid "+property.category_id);
		
		cat_array = (property.category_id).map(function(item) {
		    return parseInt(item, 10);
		});

		console.log(cat_array);

		Category.find({id: { $in: cat_array}}, function(err, category) {
		//Category.find({id:property.category_id}, function(err, category) {
			if (err){
				req.flash('error', 'Could not find Category for selected location');
				res.redirect('/admin/locations');
			}
			console.log("category"+category);
			userIds = [];
			userIds.push(property.user_id);			
			Reviews.find(conditions).limit(perPage).skip(perPage * page).exec(function(err, propertyReview) {
		    	if(err){
			  		req.flash('error', 'Error : something is wrong in property search');
					res.redirect('/errorpage');
			  	}
			  	console.log("Paginate Reviews "+propertyReview.length);
		  		Reviews.find(conditions, function(err, allReviews) {
					if (err){
						req.flash('error', 'review fetching error for selected location');
						res.redirect('/admin/locations');
					}
					//console.log("Total Reviews Counter"+c);
					reviewCount = allReviews.length;
					propertyDetails.reviews=[];
					propertyReview.forEach(function(review){							
						userIds.push(review.user_id);
					});
					console.log(userIds);
					User.find({'id':{ $in: userIds }}, function(err,users){
						if (err){
							req.flash('error', 'property and review users fetching error for selected location');
							res.redirect('/admin/locations');
						}
						var usersList=[];
						users.forEach(function(user){
							usersList[user.id]=user;
						});
						propertyDetails.user_type = usersList[propertyDetails.user_id].user_type;
						propertyDetails.user_status = usersList[propertyDetails.user_id].status;
						propertyDetails.contact_number = usersList[propertyDetails.user_id].contact_number;
						propertyDetails.first_name = usersList[propertyDetails.user_id].first_name;
						propertyDetails.last_name = usersList[propertyDetails.user_id].last_name;
						propertyDetails.mail = usersList[propertyDetails.user_id].mail;
						propertyDetails.total_reviews = reviewCount;
						var avg_review_rating = 0;
						var review_types = {one:0, two:0, three:0, four:0, five:0};							
						var i=0;
						console.log("Total Reviews User Counter"+users.length);
						//console.log(propertyReview);
						allReviews.forEach(function(review){
							avg_review_rating+=review.review_rating;
							if(review.review_rating==1)	review_types.one++;
							else if(review.review_rating==2) review_types.two++;
							else if(review.review_rating==3) review_types.three++;
							else if(review.review_rating==4) review_types.four++;
							else if(review.review_rating==5) review_types.five++;
						});
						console.log(review_types);

						propertyReview.forEach(function(review){
							propertyDetails.reviews[i]=review;
							propertyDetails.reviews[i]["first_name"]=usersList[review.user_id].first_name;
							propertyDetails.reviews[i]["last_name"]=usersList[review.user_id].last_name;
							i++;
						});												
						console.log(propertyDetails);
						propertyDetails.avg_review_rating = avg_review_rating / reviewCount;
						propertyDetails.review_types = review_types;						
						Claim.find({}, function(err, claimData) {
							if (err){
								req.flash('error', 'property and review users fetching error for selected location');
								res.redirect('/admin/locations');
							}
							if(claimData==null){
								claimStatus=0;
							}else if(claimData.length==0){
								claimStatus=0;
							}else{
								claimData.forEach(function(cliam){
									if(cliam.property_id==req.query.id){
										claimStatus=1;
									}
								});									
							}
							console.log("res.render call");
							res.render('admin/locationDetail.ejs', {
								error : req.flash("error"),
								success: req.flash("success"),
								property: propertyDetails,
								category: category,
								page: page,							
								counter : reviewCount,
								claimStatus: claimStatus,
								perPage: perPage
							});
						});
					});
				});
			});
		});	
	});
}

exports.rejectLocation = function(req, res) {
	Property.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find Location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{  
    	    var property_user = p.user;
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Could not find location');
		    }
		    else{
		    	User.findOne({_id:property_user}, function(err, userdata){
		    		if(!userdata){
		    			req.flash('error', 'Error in fetching userdetail');
    					res.redirect('/admin/locations');
		    		}else{

		    			var sendmail = {
		            		receiver_name: userdata.first_name,
		            		receiver_email: userdata.mail,
		            		email_type: 7
		            	}

            			dynamicmail.sendMail(sendmail);
    					
    					req.flash('success', 'Location deactivated successfully.');
						res.redirect('/admin/locations');	
		    		}
		    	});
			}
		    });
  		}
	});
}

exports.approveLocation = function(req, res) {	
	var currentStatus
	Property.findOne({id:req.query.id}, function(err, p) {
		currentStatus = p.status;
  		if (!p){
    		req.flash('error', 'Could not find location');
    		res.redirect('/admin/locations');
  		}
  		else 
  		{   
  			var property_user = p.user;
    	    p.status = parseInt(1);
		    p.save(function(err) {
			    if (err){
		    	    req.flash('error', 'Could not find location');
		    	    res.redirect('/errorpage');
			    }
			    else{
			    	User.findOne({_id:property_user}, function(err, userdata){
			    		console.log(userdata);

			    		if(!userdata){
			    			req.flash('error', 'Error in fetching userdetail');
	    					res.redirect('/admin/locations');
			    		}else{
					    	if(currentStatus==0){

					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 6
				            	}

		            			dynamicmail.sendMail(sendmail);
		            			
					    		req.flash('success', 'Location approved successfully.');
					    	}else{
					    		
					    		var sendmail = {
				            		receiver_name: userdata.first_name,
				            		receiver_email: userdata.mail,
				            		email_type: 8
				            	}

		            			dynamicmail.sendMail(sendmail);

			    				req.flash('success', 'Location activated successfully.');
					    	}
							res.redirect('/admin/locations');	
			    		}
			    	})
				}
		    });
  		}
	});
}

exports.allProperties = async function (req, res) {
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='first_name';
	let ordered_sort = 0;
	let categoryList = [];
	let filters = {};
	let status = [];
	let category_filter = {};

	if(req.query.page){
		page=parseInt(req.query.page);
		if(page<0)page=0;
		skip=page*perpage;
	}	
	if(req.query.keyword){
		keyword = req.query.keyword.trim().toLowerCase();			
	}
	if(req.query.ordered_column){
		ordered_column=req.query.ordered_column;
	}
	if(req.query.ordered_sort){
		ordered_sort=req.query.ordered_sort;
	}

    
    //let propertyList = [];
    //let usersIds = [];
    
		
	if(req.query.filter1){ status.push(0);  filters.filter1=req.query.filter1;}
	if(req.query.filter2){ status.push(1);	filters.filter2=req.query.filter2;}
	if(req.query.filter3){ status.push(2);	filters.filter3=req.query.filter3;}
	if(req.query.category_filter) {	filters.category_filter=req.query.category_filter;	}
	if(Object.keys(req.query).length == 0){
		status=[0,1,2,3];
	}
	if(Object.keys(req.query).length == 1 && req.query.category_filter){
		status=[0,1,2,3];
	}
	if(Object.keys(req.query).length == 1 && status.length==0){
		status=[0,1,2,3];
	}	
	
	if(Object.keys(filters).length>0 && filters.category_filter){
		category_filter.id=filters.category_filter;
	}

	console.log("welcome to allProperties");
 	let properties = await Property.find({'status':{$in:status}}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail contact_number'}).populate({path: 'category',
      model: 'Category',select: 'category_name id'}).exec();

    total_count = await Property.find({'status':{$in:status}}).populate({path: 'user',
      model: 'User',select: 'first_name last_name mail contact_number'}).populate({path: 'category',
      model: 'Category',select: 'category_name id'}).count();

    page_count = Math.ceil(total_count/perpage);

    //Get Categories Data
    var categories = await Category.find();
	categories.forEach(function(category) {
		categoryList[category.id]=category;
	}); 
	
    res.render('admin/allProperties.ejs', {
        error: req.flash("error"),
        success: req.flash("success"),
        categories: categoryList,        
        properties: properties,
        filters: filters,
        page: page,
		perpage:perpage,
		total_count: total_count,
		total_pages: page_count,
		keyword: keyword,
		ordered_sort: ordered_sort,
		ordered_column: ordered_column,
    }); 
}

function getUsers(categoryList,propertyList, usersIds,req,res,filters){
	var usersList = [];
	User.find({'id':{ $in: usersIds }},function(err,users){
		users.forEach(function(user) {	      	
	      	usersList[user.id] = [];
	      	usersList[user.id]["first_name"] = user.first_name;
	      	usersList[user.id]["last_name"] = user.last_name;
	      	usersList[user.id]["mail"] = user.mail;
	      	usersList[user.id]["contact_number"] = user.contact_number;
		});
		console.log("Actual counts:"+propertyList.length);
		res.render('admin/allProperties.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
			userLists: usersList,
			filters: filters,
			properties: propertyList
		});
	});	
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }