var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');

var User = require('../../app/models/user');
var Category = require('../../app/models/category');
var Property = require('../../app/models/property');
var Reviews  = require('../../app/models/review');
var Claim 	 = require('../../app/models/claim');

exports.removeClaim = function(req, res) {
	var user_id = req.session.user.id;
	Claim.remove({ property_id: req.query.id, user_id:user_id }, function(err) {
	    if (err) {
	        req.flash('success', 'Location claim remove failed.');
			backURL=req.header('Referer') || '/search';
			res.redirect(backURL);
	    }
	    else {
				req.flash('success', 'Location claim removed successfully.');
				backURL=req.header('Referer') || '/search';
				res.redirect(backURL);
    	    }
	});
}

exports.approvClaim = function(req, res) {
	console.log("Claimn Id "+req.query.id);
	Claim.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find claim information');
    		res.redirect('/admin/claimed-locations');
  		}
  		else 
  		{  
    	    property_id = p.property_id;
    	    new_user_id = p.user_id;
    	  	Property.updateOne({id: property_id},{ $set:{'user_id': new_user_id}}, function(err,done){
	        	if (err){
	        		req.flash('success', 'Error : something is wrong in claim property');	
	        	}
		    	Claim.update({property_id:property_id,status:0},{status: 2},{multi: true}, function(){
	        		Claim.remove({ id: req.query.id }, function(err) {
				    if (err) {
				        req.flash('success', 'Location claim approved successfully.');
						backURL=req.header('Referer') || '/search';
						res.redirect(backURL);
				    }
				    else {
							req.flash('success', 'Location claim approved successfully.');
							res.redirect('/admin/claimed-locations');	
			    	    }
			    	});
				});							
			});
	    }		  		
	});
}

exports.ignoreClaim = function(req, res) {	
	Claim.find({ id: req.query.id }, function(err, claim){
		Claim.update({id:req.query.id},{status: 2},{multi: true}, function(err){  	    	
			req.flash('success', 'Location claim ignored successfully.');
			res.redirect('/admin/claimed-locations');	
	    });
	});
}

exports.getClaimedLocations = function(req,res){
	var userIds = [];
	var propertyIds = [];
	var usersList = [];
	var category_filter = {};
	var filters = {};
	if(req.query.category_filter) {	filters.category_filter=req.query.category_filter;	}
	Claim.find({status:0}, function(err, claimedproperties) {
	   	claimedproperties.forEach(function(cproperty) {
	   		userIds.push(cproperty.user_id);
	   		propertyIds.push(cproperty.property_id);	  		
		});		
		propertyList = [];		
		Property.find({id:{ $in: propertyIds }}, function(err, properties) {				
			properties.forEach(function(property) {
				propertyList[property.id]=property;
				userIds.push(property.user_id);
			});			
			usersList = [];
			User.find({id:{ $in: userIds}}, function(err, users){
				users.forEach(function(user) {	      	
			      	usersList[user.id] = [];
			      	usersList[user.id]["first_name"] = user.first_name;
			      	usersList[user.id]["last_name"] = user.last_name;
			      	usersList[user.id]["mail"] = user.mail;
			      	usersList[user.id]["contact_number"] = user.contact_number;
				});
				console.log(usersList);
				claimedLocationsList = [];
				claimedproperties.forEach(function(cproperty) {
					claimedLocation = {};
			   		claimedLocation.id=cproperty.id;
			   		claimedLocation.property_id=cproperty.property_id;
			   		claimedLocation.property_name=propertyList[cproperty.property_id].property_name;
			   		claimedLocation.category=propertyList[cproperty.property_id].category_id;
			   		claimedLocation.contact_number=usersList[cproperty.user_id].contact_number;
			   		claimedLocation.exiting_owner_id=propertyList[cproperty.property_id].user_id;
			   		claimedLocation.exiting_owner=usersList[propertyList[cproperty.property_id].user_id].first_name;
			   		claimedLocation.mail=usersList[propertyList[cproperty.property_id].user_id].mail;
			   		claimedLocation.new_owner_id=cproperty.user_id;
			   		claimedLocation.new_owner_name=usersList[cproperty.user_id].first_name;
			   		claimedLocationsList.push(claimedLocation);
				});
				Category.find({}, function(err, category){
					categories = [];
					category.forEach(function(category){
						categories[category.id]=category;
					});
					res.render('admin/allClaimedProperties.ejs', {
						error : req.flash("error"),
						success: req.flash("success"),					
						property: claimedLocationsList,
						categories: categories,
						filters: filters,
					});
				})
			});
		});
	});
}

function getDate(){ var d = new Date(); return d.getFullYear()+ '-'+addZero(d.getMonth())+'-'+addZero(d.getDate())+' '+addZero(d.getHours())+':'+addZero(d.getMinutes())+':'+addZero(d.getSeconds()); } 

function addZero(i) { if (i < 10) { i = "0" + i; } return i; }  
