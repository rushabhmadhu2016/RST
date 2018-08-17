var numeral 	 = require('numeral');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models      = require('../../app/models/revstance_models');
var User         = models.User;
var Review 		 = models.Review;
var FlaggedReview= models.FlaggedReview;
var Property 	 = models.Property;
var Like   	     = models.Like;

exports.removeReviewReply = function(req, res) {
	console.log(req.body.id);
	Review.findOneAndUpdate({id:req.body.id}, {is_reply:parseInt(0),reply_text:'',reply_created_date:''}, {upsert:true}, function(err, doc){
    	if (err) return res.send({success:false,id: req.body.id});
    	else return res.send({success:true,id : req.body.id});
	});
}

exports.getAllReviews = function(req,res){
	var reviewCounter = 0;
	var reviewsList = [];
	var page = 1;
	var perPage = 10;
	var properties = [];
	var usersList = [];
	var users  = [];
	var conditions = {};			
	if(req.query.property_id){		
		conditions['property_id']=req.query.id;	
	}
	Review.find(conditions, function(err, allReviews) {
		if (err){
			req.flash('error', 'Error : review fetching error for selected location');
			res.redirect('/admin/reviews');
		}
		reviewCounter = reviewData.length;
		Review.find(conditions).limit(perPage).skip(perPage * page).exec(function(err, propertyReview) {
	    	if(err){
		  		req.flash('error', 'Error : something is wrong in review getting');
				res.redirect('/errorpage');
			}
			propertyReview.forEach(function(review){
				reviewsList.push(review);
				if(review.property_id.length>0) propertyIds.push(review.property_id);
				if(review.review_id.length>0) reviewIds.push(review.review_id);
				if(review.user_id.length>0) userIds.push(review.user_id);
				User.find({'id':{ $in: userIds }},function(err,users){
					if (err){
						req.flash('error', 'Error : something is wrong in getting users');
						res.redirect('/admin/locations');
					}
					users.forEach(function(user) {	      	
				      	usersList[user.id] = user.first_name+" "+user.last_name;
					});
					Property.find({'id':{ $in: propertyIds }},function(err, properties){
						if (err){
							req.flash('error', 'Error : something is wrong in getting users');
							res.redirect('/admin/locations');
						}
						properties.forEach(function(property) {	      	
					      	usersList[property.id] = property.property_name;
						});						
						res.render('admin/reviewsList.ejs', {
							error : req.flash("error"),
							success: req.flash("success")			
						});
					});
				});
			});
		});
	});
}	

exports.getAllReviewsById = function(req,res){
	res.render('admin/reviewsList.ejs', {
		error : req.flash("error"),
		success: req.flash("success")			
	});
}

exports.deleteReviewById = function(req, res){
	//res.send({success:true});/*
	Review.find({ id:req.body.id }).remove(function(err){
		if(err){
			res.send({success:false});
		}else{
			FlaggedReview.find({review_id: req.body.id}).remove(function(err){
				if (err){
					res.send({success:false});
				}
				Like.find({review_id: req.body.id}).remove(function(err){
					if (err){
						res.send({success:false});
					}	
					res.send({success:true});
				});
			});
		}
	});
}

exports.cancelFlaggedReview = function(req, res) {
	FlaggedReview.find({review_id: req.body.id}).remove(function(err){
		if (err){
			res.send({success:false});
		}
		res.send({success:true,id:req.body.id});
	});
}

exports.manageFlag = function(req, res){
	var message = {};
	if(req.session.user){		
		if(req.body.status==1){			
			FlaggedReview.find().sort([['id', 'descending']]).limit(1).exec(function(err, flagdata) {
				var flagObj = FlaggedReview();
				console.log(flagdata);
				if(flagdata == null){
					flagObj.id 	= 1;
				}
				else if(flagdata.length==0){
					flagObj.id 		= 1;	
				}
				else flagObj.id = flagdata[0].id+1;
				flagObj.user_id = req.session.user.id;
				flagObj.review_id = req.body.review_id;
				flagObj.property_id = req.body.property_id;
				flagObj.created_date=getDate();
				flagObj.status = 1;
				flagObj.save(function(err) {
					if(err){
						message.success = false;
						message.message = "Flag saved failed.";
						res.send(message);
					}else{
						req.session.flagedReviews.push(req.body.review_id);
						message.success = true;
						message.message ="Flag saved. ";
						res.send(message);
					}
				});
			});		
		}else{
			console.log(req.body);
			FlaggedReview.find({ review_id:req.body.review_id, user_id: req.session.user.id }).remove(function(err){
				if(err){
					message.success = true;
					message.message ="Delete failed. ";
					res.send(message);
				}else{
					var index = req.session.flagedReviews.indexOf(req.body.review_id);
					if (index > -1) {
					    req.session.flagedReviews.splice(index, 1);
					}
					message.success = true;
					message.message ="Unflag saved";
					res.send(message);
				}
			});
		}
	}else{
		res.send({success:false});
	}
}

exports.manageLike = function(req, res){	
	var message = {};
	var newid = 0;
	if(req.session.user){		
		if(req.body.status==1){			
			Like.find().sort([['id', 'descending']]).limit(1).exec(function(err, flagdata) {
				var flagObj = Like();
				console.log(flagdata);
				if(flagdata == null){
					flagObj.id 	= 1;
				}
				else if(flagdata.length==0){
					flagObj.id 		= 1;	
				}
				else flagObj.id = flagdata[0].id+1;
				newid = flagObj.id;
				flagObj.user_id = parseInt(req.session.user.id);
				flagObj.review_id = req.body.review_id;
				flagObj.property_id = req.body.property_id;
				flagObj.created_date=getDate();
				flagObj.status = 1;
				flagObj.save(function(err) {
					if(err){
						message.success = false;
						message.message = "Like saved failed.";
						res.send(message);
					}else{
						if(newid!=0) req.session.likedReviews.push(req.body.review_id);						
						message.success = true;
						message.id = newid;
						message.message ="Like saved. ";
						res.send(message);
					}
				});
			});		
		}else{		
		//data: {review_id:review_id, status:0,property_id:property_id},	
			Like.find({ review_id:req.body.review_id, user_id: req.session.user.id }).remove(function(err){
				message.review_id = req.body.review_id;
				message.user_id = req.user.user_id;
				if(err){
					message.success = true;
					message.message ="Delete failed. ";
					res.send(message);
				}else{
					var index = req.session.likedReviews.indexOf(req.body.review_id);
					if (index > -1) {
					    req.session.likedReviews.splice(index, 1);
					}
					message.success = true;
					message.message ="Unlike saved";
					res.send(message);
				}
			});
		}
	}else{
		res.send({success:false});
	}	
}
exports.getAllFlaggedReviews = function(req, res){	
	var propertyIds = [];
	var propertyList=[];
	var userList=[];
	var userIds = [];
	var reviewIds = [];
	var reviewList = [];
	var flaggedReviewList = [];
	var flaggedReviewsIds = [];
	var filters = {};
	if(req.query.property_id){
		filters.property_id=req.query.property_id;
	}

	FlaggedReview.find(filters, function(err, flaggedReviews){
		if (err){
			req.flash('error', 'Error : something is wrong in getting flagged reviews');
			res.redirect('/admin/flagged-reviews');
		}
		flaggedReviews.forEach(function(fproperty){		
			console.log(fproperty);	
			propertyIds.push(fproperty.property_id);
			userIds.push(fproperty.user_id);
			console.log(fproperty.review_id);
			reviewIds.push(fproperty.review_id);
		});
		console.log("FlaggedReview length"+flaggedReviews.length);
		Property.find({property_name: {$exists: true}, $where: "this.property_name.length > 0"}, function(err, allproperties) {
			if (err){
				req.flash('error', 'Error : something is wrong in getting locations from flagged reviews');
				res.redirect('/admin/flagged-reviews');
			}
			allProperties = [];
			allproperties.forEach(function(pr){
				var propertyObj = {};
				propertyObj.id=pr.id;
				propertyObj.property_name=pr.property_name;
				allProperties.push(propertyObj);
			});
		Property.find({id: { $in: propertyIds }}, function(err, properties) {
			if (err){
				req.flash('error', 'Error : something is wrong in getting locations from flagged reviews');
				res.redirect('/admin/flagged-reviews');
			}
			console.log("Property length"+properties.length);
			properties.forEach(function(pr){
				propertyList[pr.id]=pr;
			});
			Review.find({id: {$in: reviewIds }}, function(err, reviews) {
				if (err){
					req.flash('error', 'Error : something is wrong in getting locations from flagged reviews');
					res.redirect('/admin/flagged-reviews');
				}
				flaggedReviewList = [];
				reviewList = [];
				reviews.forEach(function(review){
					reviewList[review.id] = review;
					userIds.push(review.user_id);
				});
				console.log("reviews length"+reviews.length);
				User.find({id: { $in: userIds }}, function(err, users) {
					if (err){
						req.flash('error', 'Error : something is wrong in getting locations from flagged reviews');
						res.redirect('/admin/flagged-reviews');
					}
					users.forEach(function(usr){
						userList[usr.id]=usr;
					});
					console.log("Users length"+users.length);
					console.log("Total Flagged Review");
					console.log(flaggedReviews);
					flaggedReviews.forEach(function(freview){
						var freviewObj = {};
						freviewObj.id = freview.id;
						freviewObj.review_id = freview.review_id;
						freviewObj.user_id = freview.user_id;
						freviewObj.property_id = freview.property_id;
						freviewObj.property_name = propertyList[freview.property_id].property_name;
						freviewObj.customer = userList[reviewList[freview.review_id].user_id].first_name+" "+userList[reviewList[freview.review_id].user_id].last_name;
						freviewObj.mail = userList[reviewList[freview.review_id].user_id].mail;
						freviewObj.rating = reviewList[freview.review_id].review_rating;
						freviewObj.review_text = reviewList[freview.review_id].review_content;
						freviewObj.user_location = reviewList[freview.review_id].user_location;						
						freviewObj.ip_address = reviewList[freview.review_id].ip_address;
						flaggedReviewList[freview.review_id]=freviewObj;
					});
					res.render('admin/allFlaggedReviews.ejs', {
						error : req.flash("error"),
						success: req.flash("success"),
						flagged_reviews: flaggedReviewList,
						properties: allProperties,
						filters: filters,
					});
					});
				});
			});
		});
	});

	function getAverageReview(id){
		return 3;
	}
}


function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth()+1)+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }
