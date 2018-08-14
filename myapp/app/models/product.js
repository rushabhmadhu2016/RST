var mongoose = require ('mongoose');

var productSchema = mongoose.Schema ({
	id:{ type: Number, default: 1 },
	user_id: Number,
	product_name: String,
	product_image: String,
	product_description: String,
	price_in_tokens: Number,
	product_price: Number,
	product_type: Number,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('products', productSchema);