var mongoose = require ('mongoose');

var productReviewSchema = mongoose.Schema ({
	id:{ type: Number, default: 1 },
	product_id: Number,
	user_id: Number,
	product_review_title: String,
	product_review_description: String,
	status: Number,
	created_date: String,
	updated_date: String
});

module.exports = mongoose.model('product_reviews', productReviewSchema);