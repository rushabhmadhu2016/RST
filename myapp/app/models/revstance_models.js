var mongoose = require ('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var autoIncrement = require('mongodb-autoincrement');
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({	
	id:{ type: Number, default: 1 },
	first_name: String,
	last_name: String,
	mail: String,
	password: String,
	dob: { type: String, default: '' },
	gender: { type: String, default: '' },
	profile_photo: { type: String, default: '' },
	ethnicity: { type: String, default: '' },
	contact_number: { type: String, default: '' },
	user_type: Number,
	address1: { type: String, default: '' },
	address2: { type: String, default: '' },
	area: { type: String, default: '' },
	city: { type: String, default: '' },
	country: { type: String, default: '' },
	postcode: { type: String, default: '' },
	business_name: { type: String, default: '' }, 
	ip_address: String,
	status: Number,
	tag_line: { type: String, default: '' },
	is_influencer: Number,	
	wallet_id: String,
	token_balance: { type: Number, default: 0 },
	point_balance: { type: Number, default: 0 },
	badges: [String],
	membership: { type: Schema.Types.ObjectId, ref: 'Membership' }, 
	transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }], 
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }], 
	category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
	reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	auto_renew: { type: Number, default: 1 },
	referral_id: { type: Number, default: 0 },
	referral_link: { type: String, default: '' },
	business_name: { type: String, default: '' },
	business_address1: { type: String, default: '' },
	business_address2: { type: String, default: '' },
	business_contact_number: { type: String, default: '' },
	business_status: { type: Number, default: 0 },
	stripe_customer: { type: String, default: "" },
	stripe_card_id: { type: String, default: "" },
	created_date: String,
	updated_date: String,
	active_hash: String,
	forgot_hash: String,
	forgot_hash_date: String,
	is_professional_badge: { type: Number, default: 0 },
});

//Generating a hash for user password
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

//User object creation
var User = mongoose.model('User', userSchema);

//Category schema
var categorySchema = mongoose.Schema({	
	id: Number,
	category_name: String,
	status: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }], 
	created_by: {type: Number, default: 0},
	created_date: String,
	updated_date: String	
});
var Category = mongoose.model('Category', categorySchema);

//Property Schema (Location schema)
var propertySchema = mongoose.Schema({
	id: Number,
	property_name: String,
	address1: String,
	address2: String,
	area: String,
	post_code: String,
	category: [{ type: Schema.Types.ObjectId, ref: 'Category' }], 
	category_id: [Number],
	property_desc: String,
	property_images: String,
	slug : String,
	user_id: Number,
	business_key: String,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	bounty: [{ type: Schema.Types.ObjectId, ref: 'Bounty' }],
	reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	average_rating: Number,
	created_by: Number,
	status: Number,
	is_claimed: Number,
	created_date: String,
	updated_date: String
});
var Property = mongoose.model('Property', propertySchema);
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
var Product = mongoose.model('Product', productSchema);

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
var Bounty = mongoose.model('Bounty', bountySchema);

//Claim Schema
var claimSchema = mongoose.Schema({
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	user_id: Number,
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	property_id: Number,
	status: Number,
	created_date: String	
});
var Claim = mongoose.model('Claim', claimSchema);

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
var Checkin = mongoose.model('Checkin', checkinSchema);

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
var FeaturedListing = mongoose.model('FeaturedListing', featuredListingSchema);

//Flag Schema
var flaggedReviewSchema = mongoose.Schema({	
	id: Number,
	user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	user_id: Number,
	property: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	property_id: Number,
	review: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
	review_id: Number,
	status: Number,
	created_date: String
});
var Flag = mongoose.model('Flag', flaggedReviewSchema);

//Review Schema
var reviewSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
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
var Review = mongoose.model('Review', reviewSchema);

// transactions Schema (My Orders)
var transactionsSchema = mongoose.Schema ({
	id: Number,
	type: Number, //Point/Token
	product: { type: Schema.Types.ObjectId, ref: 'Product' },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	from: { type: Schema.Types.ObjectId, ref: 'User' },
	amount: Number,
	operation: String, //minus,plus
	description: String, 
	status: Number,
	created_date: String,
	updated_date: String
});
var Transaction = mongoose.model('Transaction', transactionsSchema);

//followers Schema
var followersSchema = mongoose.Schema({
	id: Number,
	follower_user: { type: Schema.Types.ObjectId, ref: 'User' },
	following_user: { type: Schema.Types.ObjectId, ref: 'User' },
	status: Number,	
	created_date: String,
	updated_date: String
});
var Follower = mongoose.model('Follower', followersSchema);

var likeSchema = mongoose.Schema({	
	id: Number,
	user:{ type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	review: { type: Schema.Types.ObjectId, ref: 'Review' },
	status: Number,
	created_date: String
});
var Like = mongoose.model('Like', likeSchema);

//membership Schema
var membershipSchema = mongoose.Schema({	
	id: Number,
	membership_title: String,
	membership_cost: String,
	status: Number,
	token_limit: Number,
	created_date: String,
	updated_date: String
});
var Membership = mongoose.model('Membership', membershipSchema);

// membershipRenewal Schema
var membershipRenewalSchema = mongoose.Schema({
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	membership: { type: Schema.Types.ObjectId, ref: 'Membership' },
	request_date: Number,
	effective_date: String,
	description: String,
	status: String,
	created_date: String,
	updated_date: String
});
var MembershipRenewal = mongoose.model('MembershipRenewal', membershipRenewalSchema);

//ProductReview Schema
var productReviewSchema = mongoose.Schema ({
	id: Number,
	product: { type: Schema.Types.ObjectId, ref: 'Product' },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	product_review_title: String,
	product_review_description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ProductReviews = mongoose.model('ProductReview', productReviewSchema);

//ReportLocation Schema
var ReportLocationSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ReportLocation = mongoose.model('ReportLocation', ReportLocationSchema);

//ReportUser Schema
var reportUserSchema = mongoose.Schema({	
	id: Number,
	reporter_user: { type: Schema.Types.ObjectId, ref: 'User' },
	spam_user: { type: Schema.Types.ObjectId, ref: 'User' },
	description: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var ReportUser = mongoose.model('ReportUser', reportUserSchema);

//ReportUser Schema
var tokenLogSchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	token_amount: Number,
	operation: Number,
	description: String,
	type: Number,
	status: Number,
	created_date: String,
	updated_date: String
});
var TokenLog = mongoose.model('TokenLog', tokenLogSchema);

//pointLogSchema Schema
var recentActivitySchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	description: String,
	property: { type: Schema.Types.ObjectId, ref: 'Property' },
	target_user: { type: Schema.Types.ObjectId, ref: 'User' },
	status: Number,
	created_date: String,
	updated_date: String
});
var RecentActivity = mongoose.model('RecentActivity', recentActivitySchema);

//pointLogSchema Schema
var paymentHistorySchema = mongoose.Schema({	
	id: Number,
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	amount: Number,
	currency: Number,
	tx_id: String,
	description: String,
	payment_type: String,
	status: Number,
	created_date: String,
	updated_date: String
});
var PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

module.exports = {
    User: User,
    Category: Category,
    Property: Property,
    Product: Product,
    Bounty: Bounty,
    Claim: Claim,
    Checkin: Checkin,
    FeaturedListing: FeaturedListing,
    Flag: Flag,
    Review: Review,
    Transaction: Transaction,
    Follower: Follower,
    Like: Like,
    Membership: Membership,
    MembershipRenewal: MembershipRenewal,
    ProductReviews: ProductReviews,
    ReportLocation: ReportLocation,
    ReportUser: ReportUser,
    TokenLog: TokenLog,
    RecentActivity: RecentActivity,
    PaymentHistory: PaymentHistory,
}