var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var reportLocation = mongoose.Schema({	
	id: Number,
	property_id: Number,
	user_id: Number,
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('report_location', reportLocation);