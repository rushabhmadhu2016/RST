var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var transactions = mongoose.Schema ({
	id: Number,
	type: Number, //Point/Token
	sender_id: Number,
	receiver_id: Number,
	amount: Number,
	operation: String, //minus,plus
	description: String, 
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('transactions', transactions);