var numeral 	 = require('numeral');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models       = require('../../app/models/revstance_models');
var User         = models.User;

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