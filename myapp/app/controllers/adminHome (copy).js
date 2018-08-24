var numeral 	 = require('numeral');
var bcrypt 		 = require('bcrypt-nodejs');
var dateFormat   = require('dateformat');
var models       = require('../../app/models/revstance_models');
var User         = models.User;
var Property     = models.Property;
var Category     = models.Category;
var Reviews      = models.Review;
var Transaction  = models.Transaction;
var FlaggedReview= models.Flag;

/* Middleware Check for Admin Type User*/
exports.loggedIn = function(req, res, next)
{
	if (req.session.user && req.session.user.user_type==3) {
		next();
	} else {
		res.redirect('/admin/login');
	}
}

/*Transfer Token - Developer: Rushabh Madhu*/
exports.transferToken = async function(req, res, next)
{	let userTypes = [1,2];
	let users = await User.find({$and: [{'user_type': {$in: userTypes } },{status:1}]});
	res.render('admin/token_transfer.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		users: users,
	});
}

exports.transferTokenSave = function(req, res, next)
{
	let user = '';
	let amount = '';

	if(req.body.amount){
		amount =req.body.amount;
	}
	if(req.body.user){
		user =req.body.user;
	}	
	var transaction = new Transaction();
	transaction.id=parseInt(1);
	transaction.amount=amount;
	transaction.type=parseInt(1);
	transaction.user=user;
	transaction.operation='plus';
	transaction.description ="Transfered by admin";
	transaction.status=parseInt(1),
	transaction.created_date = getDate();
	transaction.from = '5aaa709f8b4aac13863123e1';
	transaction.save(function(err){
		if(err){
			req.flash('error', 'Token transfer failed.');
			res.redirect('/admin/token-transfer');			
		}
		User.findOne({_id:user}, function(err, p) {
			if(err){
				req.flash('error', 'Token transfer failed.');
				res.redirect('/admin/token-transfer');		
			}
			console.log(p);
			p.token_balance=parseInt(p.token_balance)+parseInt(amount);
			p.save(function(err) {
		      if (err){
	    	 	req.flash('error', 'Token transfer failed.');
				res.redirect('/admin/token-transfer');		
		    }
		    else
		    {
    			req.flash('success', 'Token transfer successfully');
				res.redirect('/admin/token-transfer');
		    }
    		});
		});		
	});
}

function getDate(){ 
	return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 

/* Get User for Admin Side User Page*/
exports.allUsers = async function(req,res) {
	let page=0;
	let skip=0;
	let perpage=10;
	let usersList = [];
	let total_count = 0;	
	let keyword = '';
	let ordered_column='first_name';
	let ordered_sort = 0;
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
	let users = await User.find({$or: [ {first_name: { "$regex": keyword, "$options": "i" }},{ last_name:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } },{city: { "$regex": keyword, "$options": "i" }}]}).skip(skip).limit(perpage).sort(ordered_column);
	total_count = await User.find({$or: [ {first_name: { "$regex": keyword, "$options": "i" }},{ last_name:{ "$regex": keyword, "$options": "i" } }, { mail:{ "$regex": keyword, "$options": "i" } },{city: { "$regex": keyword, "$options": "i" }}]}).count();
	page_count = Math.ceil(total_count/perpage);	
	    users.forEach(function(user) {
	      usersList.push(user);
	    });	    
		res.render('admin/allUsers.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			users: usersList,
			page: page,
			perpage:perpage,
			total_count: total_count,
			total_pages: page_count,
			keyword: keyword,
			ordered_sort: ordered_sort,
			ordered_column: ordered_column,
		});
}

/* Get Properties for Admin Side Location Page*/
exports.allProperties = function(req,res){
	var categoryList = [];
	Category.find({}, function(err, categories) {
	    categories.forEach(function(category) {
	      categoryList[category.id]=category;
	    });
	    getProperties(categoryList,req,res);
	});
}

function getProperties(categoryList,req,res){
	var propertyList = [];
	var usersIds = [];
	Property.find({},function(err,properties){
			properties.forEach(function(property) {
		      	propertyList.push(property);
		      	usersIds.push(property.user_id)
			});
			getUsers(categoryList,propertyList, usersIds,req,res);
	});
}

function getUsers(categoryList,propertyList, usersIds,req,res){
	var usersList = [];
	User.find({'id':{ $in: usersIds }},function(err,users){
		users.forEach(function(user) {
	      	usersList[user.id] = [];
	      	usersList[user.id]["first_name"] = user.first_name;
	      	usersList[user.id]["last_name"] = user.last_name;
	      	usersList[user.id]["mail"] = user.last_name;
	      	usersList[user.id]["contact_number"] = user.contact_number;
		});
		res.render('admin/allProperties.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
			userLists: usersList,
			properties: propertyList
		});
	});
}

/* Approve User form Admin Side*/
exports.approveBusinessUser = function(req,res){
	var id = req.params.id;
	var user = new User();
	    var updateValue ={
    	$set:{
    		status:2
    	}
    };
    User.findOne({id:req.params.id}, function(err, p) {
  		if (!p){
    		req.flash('success', 'Could not find User');
  		}
  		else
  		{   console.log(p);
    	    p.status = parseInt(2);
		    p.save(function(err) {
		      if (err){
	    	    req.flash('success', 'Could not find User');
		        console.log('error');
		    }
		    else{
    			req.flash('success', 'Category updated successfully.');
		        console.log('success');
		    	}
    		});
  		}
	});
	res.redirect('/admin/business-users');
}

exports.getUserDetails = function(req,res){
	var id = req.query.id;//req.query.id;
	console.log(id);
	var user = new User();
    var updateValue ={
    	$set:{
    		status:2
    	}
    };
    User.findOne({id:req.query.id}, function(err, result) {
  		if (!result){
    		req.flash('error', 'Could not find User');
  		}
  		else
  		{
			req.flash('success', 'User details found');
  		}
  		res.render('admin/userDetails.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			user: result,
		});
	});
}

exports.getBusinessUserDetails = function(req,res){
	User.findOne({id:req.query.id}, function(err, user) {
  		if (!user){
    		req.flash('error', 'Could not find User');
  		}
  		else
  		{
			req.flash('success', 'User details found');
  		}
  		res.render('admin/businessDetails.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			user: user
		});
	});
}

exports.allBusinessUsers = function(req,res){
	User.find({user_type:2}, function(err, users) {
	    var usersList = [];
		var i=0;
	    users.forEach(function(user) {
	      usersList.push(user);
	    });
	  	res.render('admin/allBusinesUsers.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			users: usersList,
		});
	});
}

/* Get All Category List from Admin Side*/
exports.allCategories = function(req,res){
	Category.find({}, function(err, categorydata) {
	    var categoryList = [];	    
	    categorydata.forEach(function(category) {
	      categoryList.push(category);
	      var cat_owner = parseInt(category.created_by);
	      if(cat_owner==0){

	      }else{
	      	User.findOne({'id':cat_owner},function(err,users){
	      		console.log(users.first_name);
	      	});
	      }
	    });
		res.render('admin/allCategories.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			categories: categoryList,
		});
	});
}

/* Admin Side Counts on Dashboard Page*/
exports.home = async function(req, res) {
	var business_users =null,regular_users=null;
	var property_counts=0,review_count=0,category_counts=0;
	var user_counts = 0;
	var business_counts = 0;

	user_counts = await User.count({user_type: 1});
	property_counts = await	Property.count();
	category_counts = await Category.count();
	review_counts = await FlaggedReview.count();
	business_counts = await User.count({user_type:2});
	let usersList = await User.find({user_type:1}).limit(5).sort({id:-1}).exec();
	let bUsersList = await User.find({user_type:2}).limit(5).sort({id:-1}).exec();
	res.render('admin/adminhome.ejs', {
		error : req.flash("error"),
		success: req.flash("success"),
		user_count: user_counts,
		property_count: property_counts,
		category_count: category_counts,
		business_count: business_counts,
		review_count: review_counts,
		regular_users : usersList,
		business_users : bUsersList,
	});						
};

exports.login = function(req, res) {

	var user_count = User.count({user_type: 2}, function(err, c) {
           console.log('Count is ' + c);
      });
	if (req.session.user) {
		res.render('admin/adminhome.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
		//res.redirect('/admin/home');
	} else {
		res.render('admin/login.ejs', {
			error : req.flash("error"),
			success: req.flash("success"),
			session:req.session
		});
	}
}

exports.logout = function(req, res) {
	if (req.session.user) {
		req.logout();
		req.session.destroy(function (err) {
		res.redirect('/admin/login');
		});
	}
}
/* Approve Business User From Admin Side*/
exports.approveBusinessUser = function(req, res) {
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while approved business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business approved successfully.');
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}

exports.activateBusinessUser = function(req, res) {
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(2);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while activate business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business activated successfully.');
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}

exports.suspendBusinessUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/business-users');
  		}
  		else
  		{
    	    p.status = parseInt(3);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while suspended business');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'Business suspended successfully.');
			res.redirect('/admin/business-users');
			}
		  });
  		}
	});
}
/*Approve User from Admin Side*/
 exports.approveUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/users');
  		}
  		else
  		{
    	    p.status = parseInt(1);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while Approving User');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'User activated successfully.');
			res.redirect('/admin/users');
			}
		  });
  		}
	});
}
/*Suspend User from Admin Side*/
exports.suspendUser = function(req, res) {
	console.log('a');
	User.findOne({id:req.query.id}, function(err, p) {
  		if (!p){
    		req.flash('error', 'Could not find user');
    		res.redirect('/admin/users');
  		}
  		else
  		{
    	    p.status = parseInt(3);
		    p.save(function(err) {
		    if (err){
	    	    req.flash('error', 'Something wrong while Suspending User');
	    	    res.redirect('/errorpage');
		    }
		    else{
    		req.flash('success', 'User suspended successfully.');
			res.redirect('/admin/users');
			}
		  });
  		}
	});
}