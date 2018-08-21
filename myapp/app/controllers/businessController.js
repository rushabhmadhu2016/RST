var numeral 	 = require('numeral');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models       = require('../../app/models/revstance_models');
var BusinessPlans= require('../../app/models/business_plans');
var constants 	 = require('../../config/constants');
var User         = models.User;

exports.buyTokens = async function(req, res) {
	if(!req.session.user){
		res.redirect('/login');
	}else if(req.session.user && req.session.user_type==1){
		res.redirect('/home');
	}else{
		console.log(constants.token_price);
		res.render('buy_token',{
			error : req.flash("error"),
			success: req.flash("success"),
			user: req.session.user,
			session: req.session,
			token_price: constants.token_price,
		});
	}
}

exports.getMembershipData = async function(req,res) {
	if(!req.session.user){
		res.redirect('/login');
	}else if(req.session.user && req.session.user_type==1){
		res.redirect('/home');
	}else{
		let plans = await BusinessPlans.find();
		res.render('business_membership',{
			plans: plans,
			error : req.flash("error"),
			success: req.flash("success"),
			user: req.session.user,
			session: req.session,
		});
	}
}

exports.purchaseMembershipPlan = async function(req, res) {
	if(!req.session.user){
		res.redirect('/login');
	}else if(req.session.user && req.session.user_type==1){
		res.redirect('/home');
	}else{
		var plan_id = req.params.plan_id;
		if(!plan_id){
			req.flash('error', 'Error : something is wrong business plan purchase');
			res.redirect('/errorpage');
		}
		let plan = await BusinessPlans.findOne({'_id':plan_id});
		
		res.render('purchase_membership',{
			plan: plan,
			error : req.flash("error"),
			success: req.flash("success"),
			user: req.session.user,
			session: req.session,
		});
	}
}

exports.getBusinessDetail = function(req,res) {
	User.find({id:parseInt(req.query.id)}, function(err, business) {
		if(err){
			req.flash('error', 'Error : something is wrong Admin Panel Business');
			res.redirect('/errorpage');
		}
		else{
			var userIds = [];
		    var businessList = [];
		    if(business){
		    	business.forEach(function(bs) {	    	
			    businessList.push(bs);
			    userIds.push(parseInt(bs.user_id));
			    });
			    console.log(userIds);
			    getUsers(businessList, userIds, req, res, 'admin/businessDetails.ejs');		
		    }else{
		    	console.log('Business not found');
		    }
		}
	});
}

exports.getAllBusiness = function(req,res) {
	User.find({}, function(err, business) {
		if(err){
			req.flash('error', 'Error : something is wrong Business');
			res.redirect('/errorpage');
		}
		else{
			var userIds = [];
		    var businessList = [];	
		    console.log("Count :"+business.length);
		    business.forEach(function(bs) {	    	
		      businessList.push(bs);
		      userIds.push(parseInt(bs.user_id));
		    });	  
		    console.log(businessList);
		    getUsers(businessList, userIds, req, res, 'admin/allBusiness.ejs');	
		}
	});
}

function getUsers(businessList, usersIds, req, res, routeName){
	var usersList = [];
	User.find({'id':{ $in: usersIds }},function(err,users){
		if(err){
			req.flash('error', 'Error : something is wrong Business');
			res.redirect('/errorpage');
		}
		else{
			users.forEach(function(user) {	      	
	      	usersList[user.id] = [];
	      	usersList[user.id]["first_name"] = user.first_name;
	      	usersList[user.id]["last_name"] = user.last_name;
	      	usersList[user.id]["mail"] = user.mail;
			});
			console.log(businessList);
			console.log(usersList);			
			res.render(routeName, {
				error : req.flash("error"),
				success: req.flash("success"),
				business: businessList,
				users: usersList
			});
		}
	});	
}