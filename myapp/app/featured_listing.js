var mongoose = require('mongoose');

var featuredListingSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },
	user_id: Number,
	property_id: Number,
	start_date: String,
	end_date: String,
	plan_id: Number,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('featured_listing', featuredListingSchema);