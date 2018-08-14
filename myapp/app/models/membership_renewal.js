var mongoose = require('mongoose');

var membershipRenewal = mongoose.Schema({
	id:{ type: Number, default: 1 },
	user_id: String,
	membership_id: Number,
	request_date: Number,
	effective_date: String,
	description: String,
	status: String,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('membership_renewal', membershipRenewal);