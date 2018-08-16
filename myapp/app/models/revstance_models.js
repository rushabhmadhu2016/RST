var mongoose = require ('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var autoIncrement = require('mongodb-autoincrement');

var userSchema = mongoose.Schema({	
	id:{ type: Number, default: 1 },
	first_name: String,
	last_name: String,
	mail: String,
	password: String,
	dob: String,
	gender: String,
	profile_photo: String,
	ethnicity: String,
	contact_number: Number,
	user_type: Number,
	address1: String,
	address2: String,
	area: String,
	city: String,
	country: String,
	postcode: String,
	business_name: String, 
	ip_address: String,
	status: Number,
	tag_line: String,
	is_influencer: Number,
	wallet_balance: Number,
	wallet_id: String,
	token_balance: Number,
	point_balance: Number,
	badges: [String],
	membership: [{ type: Schema.Types.ObjectId, ref: 'Membership' }], 
	transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }], 
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }], 
	auto_renew: Number,
	referral_id: Number,
	referral_link: String,
	business_name: String,
	business_address1: String,
	business_address2: String,
	business_contact_number: String,
	business_status: { type: Number, default: 0 },
	created_date: String,
	updated_date: String,
	active_hash: String,
	forgot_hash: String,
	forgot_hash_date: String,
	is_professional_badge: { type: Number, default: 0 },
});

//User object creation
var User = mongoose.model('users', userSchema);

//Generating a hash for user password
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

//Category schema
var categorySchema = mongoose.Schema({	
	id: Number,
	category_name: String,
	status: Number,
	user_id: Number,
	created_date: String,
	updated_date: String	
});

var Category = mongoose.model('category', categorySchema);

//Property Schema (Location schema)
var propertySchema = mongoose.Schema({
	id:{ type: Number, default: 1 },
	property_name: String,
	address1: String,
	address2: String,
	area: String,
	post_code: String,
	category: [{ type: Schema.Types.ObjectId, ref: 'Category' }], 
	property_desc: String,
	property_images: String,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	bounty: [{ type: Schema.Types.ObjectId, ref: 'Bounty' }],
	created_by: Number,
	status: Number,
	is_claimed: Number,
	created_date: String,
	updated_date: String
});

var Property = mongoose.model('properties', propertySchema);

//Product Schema

var productSchema = mongoose.Schema ({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
var Product = mongoose.model('products', productSchema);

//Bounty Schema
var bountySchema = mongoose.Schema ({
	id:{ type: Number, default: 1 },
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	location: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	token: Number,
	bounty_type: String,
	product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
	status: Number,
	created_date: String,
	updated_date: String
});
var Bounty = mongoose.model('bounty', bountySchema);

//Claim Schema
var claimSchema = mongoose.Schema({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	status: Number,
	created_date: String	
});
var Claim = mongoose.model('claims', claimSchema);

//Checkin Schema
var checkinSchema = mongoose.Schema ({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	mood: String,
	status: Number,
	timestamp: Number,
	created_date: String,
	updated_date: String
});
var Checkin = mongoose.model('checkin', checkinSchema);

//FeaturedListing Schema
var featuredListingSchema = mongoose.Schema({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	start_date: String,
	end_date: String,
	plan_id: Number,
	status: Number,
	created_date: String,
	updated_date: String
});
var FeaturedListing = mongoose.model('featured_listing', featuredListingSchema);

//Flag Schema
var flaggedReviewSchema = mongoose.Schema({	
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	review: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	status: Number,
	created_date: String
});
var Flag = mongoose.model('flagged_review', flaggedReviewSchema);

//Review Schema
var reviewSchema = mongoose.Schema({	
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	review_content: String,
	review_media: String,
	review_rating: Number,
	is_reply: Number,
	reply_text: String,
	status: Number,
	ip_address: String,
	user_location: String,
	timestamp: Number,
	created_date: String,
	reply_created_date: String,	
	updated_date: String
});
var Review = mongoose.model('review', reviewSchema);

// transactions Schema
var transactionsSchema = mongoose.Schema ({
	id: Number,
	type: Number, //Point/Token
	product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	amount: Number,
	operation: String, //minus,plus
	description: String, 
	status: Number,
	created_date: String,
	updated_date: String
});
var Transactions = mongoose.model('transactions', transactionsSchema);

//followers Schema
var followersSchema = mongoose.Schema({
	id: Number,
	follower_user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	following_user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	status: Number,	
	created_date: String,
	updated_date: String
});
var Followers = mongoose.model('followers', followersSchema);

var likeSchema = mongoose.Schema({	
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	review: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	status: Number,
	created_date: String
});
var Like = mongoose.model('like', likeSchema);

//membership Schema
var membershipSchema = mongoose.Schema({	
	id: Number,
	membership_title: String,
	membership_cost: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var Membership = mongoose.model('memberships', membershipSchema);

// membershipRenewal Schema
var membershipRenewalSchema = mongoose.Schema({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	membership: [{ type: Schema.Types.ObjectId, ref: 'Membership' }],
	request_date: Number,
	effective_date: String,
	description: String,
	status: String,
	created_date: String,
	updated_date: String
});
var MembershipRenewal = mongoose.model('membership_renewal', membershipRenewalSchema);

//ProductReview Schema
var productReviewSchema = mongoose.Schema ({
	id: Number,
	product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	product_review_title: String,
	product_review_description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ProductReviews = mongoose.model('product_reviews', productReviewSchema);

//ReportLocation Schema
var ReportLocationSchema = mongoose.Schema({	
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ReportLocation = mongoose.model('report_location', ReportLocationSchema);

//ReportUser Schema
var reportUserSchema = mongoose.Schema({	
	id: Number,
	reporter_user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	spam_user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ReportUser = mongoose.model('report_user', reportUserSchema);

module.exports = mongoose.model('users', userSchema);
module.exports = mongoose.model('category', categorySchema);
module.exports = mongoose.model('properties', propertySchema);
module.exports = mongoose.model('products', productSchema);
module.exports = mongoose.model('bounty', bountySchema);
module.exports = mongoose.model('claims', claimSchema);
module.exports = mongoose.model('checkin', checkinSchema);
module.exports = mongoose.model('featured_listing', featuredListingSchema);
module.exports = mongoose.model('review', reviewSchema);
module.exports = mongoose.model('transactions', transactionsSchema);
module.exports = mongoose.model('flagged_review', flaggedReviewSchema);
module.exports = mongoose.model('followers', followersSchema);
module.exports = mongoose.model('like', likeSchema);
module.exports = mongoose.model('memberships', membershipSchema);
module.exports = mongoose.model('membership_renewal', membershipRenewalSchema);
module.exports = mongoose.model('product_reviews', productReviewSchema);
module.exports = mongoose.model('report_location', ReportLocationSchema);
module.exports = mongoose.model('report_user', reportUserSchema);