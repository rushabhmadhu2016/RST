var mongoose = require ('mongoose');

var bountySchema = mongoose.Schema ({
	id:{ type: Number, default: 1 },
	user_id: Number,
	location_id: Number,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('bounty', bountySchema);