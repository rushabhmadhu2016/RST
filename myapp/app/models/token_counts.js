var mongoose = require('mongoose');

var tokenCounts = mongoose.Schema({
	id:{ type: Number, default: 1 },	
	user_id: String,
	amount: Number,
	status: Number,	
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('token_counts', tokenCounts);