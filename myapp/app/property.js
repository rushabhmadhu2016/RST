var mongoose = require('mongoose');

var propertySchema = mongoose.Schema({
	id:{ type: Number, default: 1 },
	property_name: String,
	address1: String,
	address2: String,
	area: String,
	post_code: String,
	category_id: [Number], 
	property_desc: String,
	property_images: String,
	user_id: Number,
	created_by: Number,
	status: Number,
	is_claimed: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('properties', propertySchema);