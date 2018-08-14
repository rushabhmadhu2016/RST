var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({	
	user_id:{ type: Number, default: 1 },
	first_name: String,
	last_name: String,
	mail: String,
	password: String,
	dob: String,
	gender: String,
	profile_photo: String,
	ethnicity: String,
	contact_number: Number,
	address1: String,
	address2: String,
	area: String,
	city: String,
	country: String,
	postcode: String,
	ip_address: String,
	status: Number,
	user_type: Number,
	tag_line: String,
	is_influencer: Number,
	wallet_balance: Number,
	wallet_id: String,
	membership_id: Number,
	badges: [Number],
	auto_renew: Number,
	referral_id: Number,
	referral_link: String,
	business_name: String, 
	created_date: String,
	updated_date: String,
	active_hash: String,
	forgot_hash: String,
	forgot_hash_date: String,
});


//methods ======================
//generating a hash
userSchema.methods.generateHash = function(password) {
 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.password);
};

//create the model for users and expose it to our app
module.exports = mongoose.model('users', userSchema);
