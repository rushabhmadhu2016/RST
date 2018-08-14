var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var membershipSchema = mongoose.Schema({	
	id: Number,
	membership_title: String,
	membership_cost: String,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('memberships', membershipSchema);