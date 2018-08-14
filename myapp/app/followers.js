var mongoose = require('mongoose');

var followersSchema = mongoose.Schema({
	id:{ type: Number },
	user_id: Number,
	following_id: Number,
	status: Number,	
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('followers', followersSchema);