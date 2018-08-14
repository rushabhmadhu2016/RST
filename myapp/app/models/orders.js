var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var orders = mongoose.Schema ({
	id: { type: Number, default: 1 },
	user_id: Number,
	product_id: String,
	token_price: String,
	status: Number,
	product_type: Number,
	product_owner_type: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('orders', orders);