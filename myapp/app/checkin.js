var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var checkin = mongoose.Schema ({
	id: Number,
	user_id: Number,
	property_id: Number,
	mood: String,
	status: Number,
	timestamp: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('checkin', checkin);