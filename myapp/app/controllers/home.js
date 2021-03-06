var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var thumb 		= require('node-thumbnail').thumb;
var models      = require('../../app/models/revstance_models');
var User 		= models.User;
var Property 	= models.Property;
var Category    = models.Category;
var Review 		= models.Review;
var Claims 		= models.Claim;
var FlaggedReview= models.Flag;
var Like   	     = models.Like;
var Membership   = models.Membership;
var constants = require('../../config/constants'); 
var dynamicmail  = require('../../app/controllers/dynamicMailController');

exports.showUserMembership = async function(req, res, next) {
	var memberships = await Membership.find({'status':parseInt(1)});
	var profile = await User.findOne({'id':req.session.user.id}).
	populate({path: 'membership',model: 'Membership',select: 'membership_title'}).exec();
	console.log(memberships);
	res.render('user_membership', {
		error : req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		memberships: memberships,
		user: profile,
	});	
}

exports.showUserProfile = async function(req, res, next){
	var myparams = req.url;
	var usersId;
	var api_response = {};
	var userid=parseInt(req.params.userid);
	if(myparams.indexOf('api')>0){
		var calltype='api';
		usersId = 1;
	}else{
		var calltype='web';
		usersId = userid;
	}
	var profile = await User.findOne({'id':userid}).
	populate({path: 'membership',model: 'Membership',select: 'membership_title'}).exec();
	if(!profile){
		req.flash('error', 'Error : No such user found in system.');
		res.redirect('/errorpage');
	}
	if(calltype=='api'){
		api_response.message='Profile retrived.';
		api_response.code=200;
		api_response.status=true;
		api_response.profile=profile;
		res.send(api_response);
	}else{	
		res.render('showUserProfile', {
		error : req.flash("error"),
		success: req.flash("success"),
		session: req.session,
		user: profile,
		});				
    }	
}

exports.isLoggedIn = function(req, res, next){
	if (req.session.user) { // req.session.passport._id
		if(req.session.user.user_type==3){
			res.redirect('/logout');	
		}
		next();
	} else {
		res.redirect('/login');
	}
}

exports.showIndexPage = function(req, res) {
	if(req.session.user){
		res.redirect('/home');
	}else{
		res.render('index', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.checkForEmailPage = function(req,res){
	var email = req.body.emailid;
	User.count({mail:email}, function(err,p) {
		if(err){
			res.send({status:false,message:'err'});
		}else{
			if(p>0){
				res.send({status:false,message:'exist'});
			}
			else{
				res.send({status:true,message:'Go Ahead'});
			}
		}
	});
}

exports.checkForAddReviewPage = function(req, res) {	
	var user_id = req.session.user.id;	
	var property_id = req.query.propertyId;
	var current_hour = Math.floor(Date.now() / 1000)/(60*60);
	var previous_hour = current_hour - 1;
	var previous_month = current_hour - (24*30);	
	
	Review.count({user_id:user_id,property_id:property_id, timestamp: { $gt: previous_month, $lt: current_hour }}, function(err,p) {		
		if(p>0){
			res.send({status:false,message:'propertylimit'});			
		}else{			
			Review.count({user_id:user_id, timestamp: { $gt: previous_hour, $lt: current_hour }}, function(err,c){
				if(c>=3){
					res.send({status:false, message:'hourlimit'});
				}
				else
				{	
					res.send({status: true});
				}		
			});
		}
	});
}

exports.showProfilePage = async function(req, res) {
	var myparams = req.url;
	var userId;
	var api_response = {};
	if(myparams.indexOf('api')>0){
		var calltype='api';
		userId = 1;
	}else{
		var calltype='web';
		userId = req.session.user.id
	}
	let userMembership = [];
	let membershipTitle = await Membership.findOne({_id:req.session.user.membership});
	
	User.findOne({id:userId}, function(err, profile) {
		if(err){
			if(calltype=='api'){
				api_response.message='';
				api_response.code=302;
				api_response.status=false;
				api_response.profile={};
				res.send(api_response);
			}else{
				req.flash('error', 'Error : something is wrong with Profile Page');
				res.redirect('/errorpage');
			}
		}
		else{
			if(calltype=='api'){
				api_response.message='Profile retrived.';
				api_response.code=200;
				api_response.status=true;
				api_response.profile=profile;
				res.send(api_response);
			}else{	
				res.render('profile', {
				error : req.flash("error"),
				success: req.flash("success"),
				session: req.session,
				membership: membershipTitle,
				user: profile,
				});				
		    }
		}		
	});
}

exports.UpdateProfile = async function(req, res) {
	
	let user = await User.find({id: req.session.user.id});	
	user.forEach(function(profile){
	if (profile){
		profile.first_name = req.body.first_name;
		profile.last_name = req.body.last_name;
		profile.dob = req.body.dob;
		profile.gender = req.body.gender;
		profile.contact_number = req.body.contact_number;
		profile.ethnicity = req.body.ethnicity;
		profile.tag_line = req.body.tag_line;
		profile.profile_photo = req.body.profile_photo;
		profile.address1 = req.body.address1;
		profile.address2 = req.body.address2;
		profile.area = req.body.area;
		profile.auto_renew = Boolean(req.body.auto_renew);
		profile.city = req.body.city_name;
		profile.country = req.body.country_name;
		profile.postcode = req.body.post_code;

		profile.save(function(err) {
	            if (err){
	                req.flash('success', 'Opps. Something went wrong..');
	                console.log('error');
	       		}
	    		else
	    		{
	        		req.flash('success', 'Profile updated successfully.');
	        		console.log('success');
	        		res.redirect('/MyProfile');
	        	}
    		});        	
    	}    		      
	});
}

exports.setProfesstionalBadge = function(req, res){
	User.findOne({id:req.body.userId}, function(err, userData) {
 		if(err){
			res.send({'status' : 'false', 'message' : 'something is wrong while updating professtional Badge', 'data': null});
		}
		else{
			if (userData){

				if(req.body.is_checked=='true'){
					userData.is_professional_badge = 1;
				}else{
					userData.is_professional_badge = 0;
				}
				userData.save(function(err) {
	                if (err){
	                	res.send({'status' : 'false', 'message' : 'Opps. Something went wrong..', 'data': null});
	           		}
            		else
            		{
            			res.send({'status' : 'true', 'message' : 'Profile updated successfully.', 'data': null});
                	}
                });
			}
		}
	});
	return true;
}

exports.showHomePage = function(req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	if(req.session.user){
		//res.redirect('/business');
	
		Property.find({status:1}, function(err, c) {
			if(err){
				req.flash('error', 'Error : something is wrong with location');
				res.redirect('/errorpage');
			}
			else{
				var propertyList = [];      
		        c.forEach(function(user) {
		          propertyList.push(user);
		    	});
		        res.render('home', {
				error : req.flash("error"),
				success: req.flash("success"),
				session:req.session,
				properties: propertyList,
				});
			}			
		});		
	}
}

exports.showAboutPage = function(req, res) {
		res.render('about', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
}
exports.showContactUsPage = function(req, res) {
		res.render('contactus', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
}

exports.showTermsPage = function(req, res) {
		res.render('terms', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
}

exports.showPrivacyPage = function(req, res) {
	res.render('privacy', {
		error : req.flash("error"),
		success: req.flash("success"),
		session:req.session
	});	
}

exports.showDeveloperHelpPage = function(req, res) {
		res.render('developer-help', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
}

exports.showLoginPage = function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('login', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.showSignupPage = function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('signup', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.showForgotPasswordPage = function(req, res) {
	if (req.session.user) {
		res.redirect('/');
	} else {
		res.render('forgotpass', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.logout = function(req, res) {
	req.logout();
  	req.session.destroy(function (err) {
    res.redirect('/');
  	});
}

exports.changePasswordPage = function(req, res) {
		res.render('changepassword', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
}

exports.sendForgotPasswordLinkPage = function(req, res) {
	console.log('send forgotpass link');

	User.findOne({ 'mail' :  req.body.email }, function(err, user) {
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else{
			if (user) {
				if(user.status==3)
				{
					req.flash('error', 'Sorry, your account is suspended');
					res.redirect('/forgotpassword');
				}else{
					var expiretime = new Date().getTime() + 60*60*1000;
					var forgot_code=bcrypt.hashSync(Math.floor((Math.random() * 99999999) *54), null, null);
	        		User.updateOne({'id': user.id},{ $set:{'forgot_hash': forgot_code,'forgot_hash_date':expiretime}},function(err,done){
	            	if (err){
	            		req.flash('success', 'Error : Error : something is wrong');
						res.redirect('/login');
	            	}
	            	var sendmail = {
	            		receiver_name: user.first_name,
	            		receiver_email: user.mail,
	            		forgot_code: forgot_code,
	            		email_type: 1
	            	}
	            	dynamicmail.sendMail(sendmail);
	            	req.flash('success', 'Password activation link sent to your email');
					res.redirect('/login');
	             });
				}				
			}
			else{
				console.log("email not exist");
	        	req.flash('error', 'This email address does not exists');
				res.redirect('/forgotpassword');
			}
		}
	});
}

exports.sendContactUsMailPage = function(req, res) {
   	var sendmail = {
		receiver_name: req.body.contact_name,
		receiver_email: req.body.contact_email,
		contact_subject: req.body.contact_subject,
		contact_desc: req.body.contact_desc,
		email_type: 4
	}
	dynamicmail.sendMail(sendmail);
	var sendadminmail = {
		receiver_email: constants.adminemail,
		sender_name: req.body.contact_name,
		sender_email: req.body.contact_email,
		contact_subject: req.body.contact_subject,
		contact_desc: req.body.contact_desc,
		email_type: 5
	}
	dynamicmail.sendMail(sendadminmail);
   	req.flash('success', 'We will contact you soon');
	res.redirect('/contactus');
}

exports.confirm = function(req, res) {
	console.log('Hello from activate');
	var hash = req.param('active_link');
	User.findOne({ 'active_hash' :  hash }, function(err, user) {
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else{
			if (user) {
	        	if(user.status==0){
	        		User.updateOne({'active_hash': hash},{ $set:{'status': 1}},function(err,done){
	            	if (err)if (err){
	            		req.flash('success', 'Error : Error : something is wrong');
						res.redirect('/login');
	            	}
	            	req.flash('success', 'Your email is verified, please login to access account');
					res.redirect('/login');
	              });
	        	}
	        	else{
	        		req.flash('error', 'Your email is already verified, please login to access account');
					res.redirect('/login');
	        	}
	        }
	        else{
	        	console.log("hash not avail");
	        	req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
	        }
		}        
	});		 
}

exports.addReviewPage = function(req, res) {
	if(req.files && (req.files.length<=10)){
	    var uploaded_files;
	    uploaded = req.files.map(function(value) {
			return value.filename;
		});
		uploaded_files = uploaded.join();
		uploaded.map(function(a){
			generateThumb('public/uploads/'+a, '345px', 'thumb_', 'public/uploads/thumbs/');
		})

	    Review.find().sort([['id', 'descending']]).limit(1).exec(function(err, reviewdata) { 
			if(err){
				res.send({'status':false,'backurl':req.originalUrl});
			}
			var newReviews = new Review();
			var day = new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
			newReviews.is_guest = req.body.review_post_user;
			newReviews.review_content = req.body.review_content;
		    newReviews.review_rating = req.body.rating_number;
		    newReviews.review_media = uploaded_files;
		    newReviews.is_reply = 0;
		    newReviews.status = 0;		    
			newReviews.property_id = req.body.property_Id;
		    newReviews.user_id = req.session.user.id;		    
		    newReviews.ip_address = req.session.ip_address;
		    newReviews.user_location = req.session.country;
		    newReviews.created_date = day;
		    newReviews.updated_date = day;
		    newReviews.timestamp = Math.floor(Date.now() / 1000)/(60*60);
		    if(reviewdata.length==0)
		    	newReviews.id = 1;
			else
				newReviews.id = reviewdata[0].id+1;

		    newReviews.save(function(err) {
		        if(err){
		        	res.send({'status':false,'backurl':req.originalUrl});
				}else{
					res.send({'status':true,'backurl':req.originalUrl});
			    }		       	
			});
		});
	}
}

exports.updateReviewPage = function(req, res) {
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
		var delete_review_images = exist_image.join();
		}
	
		if(req.body.images==undefined && uploaded_arr.length==1 && uploaded_arr[0]==''){
			console.log("undefined or blank");
			merge_img = [];
		}
		else if(uploaded_arr.length==1 && uploaded_arr[0]==''){
			var merge_img = req.body.images;
		}else if(req.body.images==undefined){
			merge_img = uploaded_arr;
		}else{
			merge_img = uploaded_arr.concat(req.body.images);
		}
		update_merge = merge_img.join();		
	}
	Review.findOne({'id':req.body.editPageReviewId,'property_id':req.body.prop_Id,'user_id':req.session.user.id}, function(err, review) {	
		if(err){
			console.log("error");
		}else{
			if(review){
				var db_reviewimages = review.review_media.split(",");
				
			if(req.body.images!=undefined){
				for (var i = 0; i < db_reviewimages.length; i++) {
					if((delete_review_images.indexOf(db_reviewimages[i])) == (-1)){
						
						if(fs.existsSync('public/uploads/'+db_reviewimages[i])){
							fs.unlink('public/uploads/'+db_reviewimages[i], (err) => {
							if (err){
							  	console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}						

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_reviewimages[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_reviewimages[i], (err) => {
							if (err){
							  	console.log('file delete error');
							  }
							  else{
							  console.log('File deleted!');
							  }
							});
						}
					}
				}
			}else{
				if((review.review_media.length)!=0){
					for (var i = 0; i < db_reviewimages.length; i++) {

						if(fs.existsSync('public/uploads/'+db_reviewimages[i])){
							fs.unlink('public/uploads/'+db_reviewimages[i], (err) => {
							if (err){
								console.log('file delete error');
							  }else{
							  	console.log('File deleted!');
							  }
							});
						}

						if(fs.existsSync('public/uploads/thumbs/thumb_'+db_reviewimages[i])){
							fs.unlink('public/uploads/thumbs/thumb_'+db_reviewimages[i], (err) => {
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
			var day = getDate();
				review.is_guest = req.body.review_post_user;
				review.review_content = req.body.review_content;
				review.review_media = update_merge;
			    review.review_rating = req.body.rating_number;
			    review.updated_date = day;

			     review.save(function(err) {
	                if (err){
		                console.log('review update error');
		                res.send({'status':false,'backurl':req.originalUrl});
	           		}
            		else
            		{
                		console.log('review update success');
                		res.send({'status':true,'backurl':req.originalUrl});
                	}
	            });
			}			
		}
	});
}

exports.deleteReviewPage = function(req,res){
	var id = req.param('review');
	Review.findOne({id:id,user_id: req.session.user.id}, function(err, review) {
		var del_images = review.review_media.split(",");
		Review.deleteOne({ 'id' :  id}, function(err){
		var index = req.session.flagedReviews.indexOf(id);
		if (index > -1) {
			req.session.flagedReviews.splice(index, 1);
		}
		var index = req.session.likedReviews.indexOf(id);
		if (index > -1) {
			req.session.likedReviews.splice(index, 1);
		}
		if((review.review_media.length)!=0){
			for (var i = 0; i < del_images.length; i++) {

				if(fs.existsSync('public/uploads/'+del_images[i])){
					fs.unlink('public/uploads/'+del_images[i], (err) => {
					if (err){
						console.log('file delete error');
					  }else{
					  	console.log('File deleted!');
					  }
					});
				}

				if(fs.existsSync('public/uploads/thumbs/thumb_'+del_images[i])){
					fs.unlink('public/uploads/thumbs/thumb_'+del_images[i], (err) =>{
						if (err){
							console.log('file delete error');
					  	}else{
							console.log('File deleted!');
					  	}
					});
				}
			}
		}

		FlaggedReview.deleteMany({'review_id' :  id}, function(err){
			if(err){
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
				console.log('err');
			}
			console.log('flagged Review deleted');			
		});

		Like.deleteMany({'review_id' :  id}, function(err){
			if(err){
				req.flash('error', 'Error : something is wrong');
				res.redirect('/errorpage');
				console.log('err');
			}
			console.log('Review Like deleted');			
		});
	 	req.flash('success', 'Review deleted successfully');
     	res.redirect(req.header('Referer'));
	});
	});
}

exports.deletereplyReviewPage = function(req,res){
	Review.updateOne({'id': req.body.review_id},{ $set:{'is_reply': 0,'reply_text':''}},function(err,done){
    	if (err){
    		res.send({'status':false});
    	}
    	else{
    		res.send({'status':true});
    	}
    });
}

exports.getEditReviewDetailPage = function(req, res) {
	var review_id = req.param('review_id');
	Review.findOne({id:review_id,user_id: req.session.user.id}, function(err, review) {
    	if(err){
			console.log('err');
			res.send({'status':false});
		}
		res.send({'status':true,'data':review});
	});	
}

exports.forgotPasswordConfirm = function(req, res) {
	var hash = req.param('active_link');
	User.findOne({ 'forgot_hash' :  hash }, function(err, user) {
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else{
			if (user) {
				var currentTime = new Date().getTime();
	        	if(user.forgot_hash_date>currentTime){
	        			console.log('forgotdate is big');
				        res.render('resetpassword', {
						error : req.flash("error"),
						success: req.flash("success"),
						session:req.session,
						user:user.id
					});
	        	}
	        	else{
	        		console.log('day is big');
	        		req.flash('error', 'Sorry, Session expired, please regenerate activation key');
					res.redirect('/forgotpassword');
	        		}
		    }
	        else{
	        	console.log("hash not avail");
	        	req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
	        }
		}        
	});		 
}

exports.createNewPasswordPage = function(req, res) {
	User.findOne({ 'id' :  req.body.user_id }, function(err, user) {
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else{
			if (user) {
				user.password = user.generateHash(req.body.password);
				user.forgot_hash = '';
				user.forgot_hash_date = '';
				user.save();
            	req.flash('success', 'Password reset successfully');
				res.redirect('/login');             
			}
			else{
				req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

exports.updatePasswordPage = function(req, res) {
	User.findOne({ 'id' :  req.session.user.id }, function(err, user) {
		if(err){
			req.flash('error', 'Error : something is wrong');
			res.redirect('/errorpage');
		}
		else{
			if (user) {
			 	if (!user.validPassword(req.body.old_password))
				 {
				 	req.flash('error', 'Sorry, old password does not match with database');
					res.redirect('/changepassword');
				 }
				 else{
					user.password = user.generateHash(req.body.new_password);
					user.save();
		         	req.flash('success', 'Password changed successfully');
					res.redirect('/changepassword');
				}
			}
			else{
				console.log("email not exist");
	        	req.flash('error', 'Sorry, We unable to find you, please signup');
				res.redirect('/signup');
			}
		}
	});
}

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

exports.showPropertyDetailPage = async function(req, res) {
	var propertyDetails = {};
	var keyword = req.query.id;
	var page = req.query.page;
	var category = req.query.category;
	var counter = 0;
	var filter={};
	var claimStatus = 0;
	var otherClaimStatus = 0;
	var claimId = '';
	var perPage=5;
	var userId=0;
	if(req.session.user){
		userId = req.session.user.id;
	}
	filter.keyword=keyword;
	filter.category=category;

	//get Particular property data
	var slug = req.params.slug;
	var properties = await Property.find({slug: slug}).exec(); 
	properties.forEach(function(property) {
		
	if(property==null || property.length==0){
		req.flash('error', 'Could not find location');
		backURL=req.header('Referer') || '/search';
		res.redirect(backURL);
	}else {
		if(property.status != 1){
			if(req.session.user){
				if(req.session.user._id!=property.user){				
					req.flash('error', 'Could not find location');
					backURL=req.header('Referer') || '/search';
					res.redirect(backURL);
				}
			}else{				
				req.flash('error', 'Could not find location');
				backURL=req.header('Referer') || '/search';
				res.redirect(backURL);			
			}
		}
		propertyDetails.id = req.query.id; 
		propertyDetails.property_name = property.property_name;
		propertyDetails.address1 = property.address1;
		propertyDetails.address2 = property.address2;
		propertyDetails.property_desc = property.property_desc;
		propertyDetails.user_id = property.user_id;
		propertyDetails.status = property.status;
		propertyDetails.created_date = property.created_date;
		propertyDetails.property_images = property.property_images;
		propertyDetails.category = property.category;
		propertyDetails.category_id = property.category_id;
		propertyDetails.post_code = property.post_code;
		propertyDetails.city = property.city;
		propertyDetails.country = property.country;

		Claims.find({status:0, property_id:propertyDetails.id}, function(err, claimData) {		
		if (err){
			req.flash('error', 'Could not find claim detail for property.');
			res.redirect('/admin/locations');
		}
		if(claimData.length>0){			
			claimData.forEach(function(cliam){
				if(cliam.user_id==userId && cliam.property_id==propertyDetails.id){
					claimStatus=1;
					claimId = cliam.id;
				}			
			});
		}
		Category.find({}, function(err, category) {
		if (err){
			req.flash('error', 'Could not find Category for selected location');
			res.redirect('/admin/locations');
		}
		categories = [];
		category.forEach(function(cate){
			categories[cate.id]=(cate);
		});
		userIds = [];
		userIds.push(property.user);
		Review.find({property_id: property.id}, function(err, reviewList){
			if (err){
				req.flash('error', 'review fetching error for selected location');
				res.redirect('/admin/locations');
			}
			counter = reviewList.length;
			console.log("reviewList Length : "+reviewList.length);
			Review.find({property_id: property.id}).limit(perPage).skip(perPage * page).exec(function(err, reviewData) { 
				propertyDetails.reviews=[];
				reviewData.forEach(function(review){							
					userIds.push(review.user);
				});			
			User.find({'_id':{ $in: userIds }}, function(err,users){
				
				if (err){
					req.flash('error', 'property and review users fetching error for selected location');
					res.redirect('/admin/locations');
				}
				var usersList=[];
				users.forEach(function(user){

					usersList[user.id]=user;
				});
				propertyDetails.property_images = property.property_images;
				propertyDetails.category_name = getCategoryName(property.category_id,categories);
				propertyDetails.user_type = users.user_type;
				propertyDetails.user_status = users.status;
				propertyDetails.contact_number = users.contact_number;
				propertyDetails.first_name = users.first_name;
				propertyDetails.last_name = users.last_name;
				propertyDetails.mail = users.mail;
				propertyDetails.total_reviews = counter;//post_code
				propertyDetails.post_code = property.post_code;
				propertyDetails.city = property.city;
		  		propertyDetails.country = property.country;
				var avg_review_rating = 0;
				var review_types = {one:0, two:0, three:0, four:0, five:0};							
				var i=0;				
				reviewList.forEach(function(review){
					avg_review_rating+=review.review_rating;
					if(review.review_rating==1)	review_types.one++;
					else if(review.review_rating==2) review_types.two++;
					else if(review.review_rating==3) review_types.three++;
					else if(review.review_rating==4) review_types.four++;
					else if(review.review_rating==5) review_types.five++;					
				});
				reviewData.forEach(function(review){					
					propertyDetails.reviews[i]=review;
					propertyDetails.reviews[i]["first_name"]=usersList[review.user_id].first_name;
					propertyDetails.reviews[i]["last_name"]=usersList[review.user_id].last_name;
					i++;
				});
				propertyDetails.avg_review_rating = avg_review_rating / reviewList.length;
				propertyDetails.review_types = review_types;
				res.render('listing/propertyDetail.ejs', {
						error : req.flash("error"),
						success: req.flash("success"),
						session: req.session,
						page: page,
						keyword: keyword,
						filters: filter,
						property: propertyDetails,
						categories: categories,
						counter:counter,
						claimStatus: claimStatus,
						otherClaimStatus: otherClaimStatus,
						claimId:claimId,
						perPage:perPage
					});
				});
			});
		});
		});
	});
	}
	});		
}

exports.showSearchPage = async function(req, res) {
	console.log('showSearchPage');
	var keyword='';
	if(req.query.keyword){		
		keyword = req.query.keyword.trim().toLowerCase();	
	}else{
		keyword='';
	}
	var category = req.query.category;
	var filter={};
	var propertyIds = [];
	var userIds = [];
	var reviewsList = [];
	var searchedProperties = [];
	var page = 0;
	var perPage = 5;
	var categoriesList = [];
	var propertyList = [];
	var usersList = [];
	filter.keyword=keyword;
	filter.category=category;
	if(req.query.page){
		if(IsNumeric(req.query.page)){
			page = req.query.page;
		}else{
			req.flash('error', 'Invalid param page in property search');
			res.redirect('/errorpage');
		}
	}
	if(req.query.category){
		filter.category_filter=req.query.category;
		categoriesListToSearch = {'category_id': req.query.category};
	}else{
		filter.category_filter='';
		categoriesListToSearch = {};
	}	

	//Get Claim Data
	var claimDataProperies = [];
	var claimData = await Claims.find();
	claimData.forEach(function(claim){
		claimDataProperies.push(claim.property);
	})
	
	//Get Categories Data
    var categories = await Category.find();
	categories.forEach(function(category) {
		categoriesList[category.id]=category;
	}); 

	//Get Properties with User, Category and Reviews
	propertiesCount = await Property.count({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, categoriesListToSearch, {status:1}]});
	console.log(propertiesCount);
	var counter = propertiesCount;

	properties = await Property.find({$and: [{$or: [ {property_name: { "$regex": keyword, "$options": "i" }},{ address1:{ "$regex": keyword, "$options": "i" } }, { address2:{ "$regex": keyword, "$options": "i" } },{post_code: { "$regex": keyword, "$options": "i" }}]}, categoriesListToSearch, {status:1}]}).limit(perPage).skip(perPage * page)
    .sort({ property_name: 'asc'}).populate({path: 'user',
      model: 'User',select: 'id first_name last_name user_type'}).populate({path: 'category',
      model: 'Category',select: 'category_name id'}).populate({path: 'category',
      model: 'Review'}).exec();
    	properties.forEach(function(property) {	  				
			var propertyItem = {};
			propertyItem.id = property.id;
			propertyItem.status = property.status;
			propertyItem.property_name = property.property_name;
			propertyItem.category_id = property.category_id;			
			propertyItem.category = property.category.category_name;
			propertyItem.user_type = property.user.user_type;
			propertyItem.user_id = property.user_id;
			propertyItem.property_image = property.property_images;
			propertyItem.address1 = property.address1;
			propertyItem.address2 = property.address2;
			propertyItem.post_code = property.post_code;
			propertyItem.city = property.city;
			propertyItem.slug = property.slug;
			propertyItem.country = property.country;
			propertyItem.review_count = property.reviews.count;
			propertyItem.average_rating = property.average_rating;
			propertyItem.is_claimed = checkIsClaimedProperty(property.id, claimDataProperies);
			searchedProperties.push(propertyItem);
   		});
		res.render('search', {
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
}

function getDate(){ 
	return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

function getDate1(date){ 
	var d = new Date(date);
	return d.toLocaleString("en-US", {timeZone: "Europe/London"});	
}

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }   

function getPropertyAverageRating(property_id, reviews){
	var counter = 0;
	var totcounter = 0;
	reviews.forEach(function(review){
		if(review.property_id==property_id){ counter+=review.review_rating; totcounter++;}
	});
	return isNaN(parseInt(counter/totcounter)) ? 0 : parseInt(counter/totcounter);
}

function getPropertyReviewCount(property_id, reviews){
	var counter = 0;
	reviews.forEach(function(review){
		if(review.property_id==property_id) counter++;
	});
	return counter;
}

function getCategoryName(id,catList){
	var category_id = id;
	var catname = [];
	catList.forEach(function(cat){		
		if(category_id.indexOf(cat.id.toString()) == -1){
			//console.log("Not found");
		}else{
			catname.push(cat.category_name);		
		}
	});
	return catname.join();
}

function checkIsClaimedProperty(id, list){
		var flag=0;
		list.forEach(function(nid){			
			if(id==nid){
				flag++;	
			}
		});
		if(flag==0)	return false;
		else return true;
}

function generateThumb(fileName, width, prefix, destinationFolder){
	thumb({
	  prefix: prefix, 
	  suffix: '',
	  source: fileName,
	  destination: destinationFolder,
	  concurrency: 1,
	  overwrite: true,
	  width:width,
	}, function (err, stdout, stderr) {
  		if(err) { return false;}else{return true;}
	});
}