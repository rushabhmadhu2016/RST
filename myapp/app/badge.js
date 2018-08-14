var mongoose = require('mongoose');

var badgeSchema = mongoose.Schema({
	id:{ type: Number, default: 1 },	
	badge_title: String,
	status: Number,
	badge_point_start: String,
	badge_point_end: String,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('badges', badgeSchema);