var HomeController = require('../app/controllers/home');
var AdminHomeController = require('../app/controllers/adminHome');
var ListingController = require('../app/controllers/listing');
var BusinessController = require('../app/controllers/businessController');
var ReviewController = require('../app/controllers/reviewController.js');
var CategoryController = require('../app/controllers/categoryController.js');
var LocationController = require('../app/controllers/locationController.js');
var FrontListingController = require('../app/controllers/frontListingController.js');
var ClaimController = require('../app/controllers/claimController.js');
var apiController = require('../app/controllers/apiController.js');
var BlogController = require('../app/controllers/blogController.js');
var BlogsController = require('../app/controllers/blogsController.js');
var EmailController = require('../app/controllers/emailController.js');

var fs = require('fs');
var path = require('path');
var multer = require('multer');
var connect = require('connect');
var http = require('http');
var net = require('net');
var app = connect();
var requestIp = require('request-ip');
var share = require('social-share');
var where = require('node-where');
var request = require('request');

//var upload = multer({ dest: 'public/uploads/' });
var storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null,file.fieldname +'_'+Math.floor(Math.random() * 1001)+'_'+ Date.now()+ path.extname(file.originalname));
    },
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    }
})
var upload = multer({ storage: storage });

//you can include all your controllers

module.exports = function (app, passport) {
    /*General Routes*/
    app.use(function(req, res, next){
        res.locals.req = req;
        res.locals.res = res;
        next();
    }); 

    /*Globa cache management script*/  
    app.use(function(req, res, next) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    });
 
    app.post('/signup', usernameToLowerCase, passport.authenticate('local-signup', {
        successRedirect: '/login',
        failureRedirect: '/signup',
        failureFlash: true 
    }));

    app.post('/login', usernameToLowerCase, passport.authenticate('local-login', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    app.get('/sharetwitter',function(req, res) {
        var review = req.param('review')
        var prop_url =req.header('Referer');
    var url = share('twitter', {'title':review,'url':prop_url});
    res.redirect(url);
    });

    app.get('/sharefacebook',function(req, res) {
        var review = req.param('review')
        var prop_url =req.header('Referer');
    var url = share('facebook', {'title':review,'url':prop_url});
    res.redirect(url);
    });
    
    // app.post('/testCall', AdminHomeController.testCall);    
    // app.post('/api/testCall', AdminHomeController.testCall);    
    app.get('/', HomeController.showIndexPage);
    app.get('/about', HomeController.showAboutPage);
    app.get('/developer-help', HomeController.showDeveloperHelpPage);
    app.get('/contactus', HomeController.showContactUsPage);
    app.get('/terms', HomeController.showTermsPage);
    app.get('/privacy', HomeController.showPrivacyPage);
    app.get('/login', HomeController.showLoginPage);
    app.get('/signup', HomeController.showSignupPage);
    app.get('/forgotpassword', HomeController.showForgotPasswordPage);
    app.post('/sendforgotlink',HomeController.sendForgotPasswordLinkPage);
    app.post('/sendcontactusmail',HomeController.sendContactUsMailPage);
    app.post('/createpassword',HomeController.createNewPasswordPage);
    app.get('/logout', HomeController.logout);
    app.get('/activate/confirm',HomeController.confirm);
    app.get('/forgotpassword/confirm',HomeController.forgotPasswordConfirm);
    app.get('/home', HomeController.isLoggedIn, HomeController.showHomePage);
    app.get('/search', HomeController.showSearchPage);
    app.get('/property/property-details',HomeController.isLoggedIn, HomeController.showPropertyDetailPage);
    app.get('/location/location-details', HomeController.showPropertyDetailPage);
    /*Front side Operations Routes*/
    app.get('/MyProfile', HomeController.isLoggedIn, HomeController.showProfilePage);
    app.get('/api/MyProfile', HomeController.showProfilePage);
    app.post('/updateprofile',HomeController.UpdateProfile);
    app.get('/changepassword',HomeController.isLoggedIn,HomeController.changePasswordPage);
    app.post('/updatepassword',HomeController.updatePasswordPage);
    app.get('/Mylisting',HomeController.isLoggedIn, ListingController.showMyListingPage);
    app.get('/detailListing', HomeController.isLoggedIn, ListingController.showPropertyListingPage);
    app.get('/addListing', HomeController.isLoggedIn, ListingController.showCreateListingPage);
    app.post('/storeListing', upload.array('property_image',11), ListingController.storePropertyListing);
    app.post('/updateListing', upload.array('property_image',11), ListingController.updatePropertyListing);
    app.get('/editListing/:property', HomeController.isLoggedIn, ListingController.editPropertyListingPage);
    app.get('/deleteListing', HomeController.isLoggedIn, ListingController.deletePropertyListingPage);
    app.post('/addreview',upload.array('review_images',11),HomeController.addReviewPage);
    app.post('/updatereview',upload.array('editreview_images',11),HomeController.updateReviewPage);
    app.get('/deletereview', HomeController.isLoggedIn, HomeController.deleteReviewPage);
    app.post('/deletereplyreview', HomeController.deletereplyReviewPage);
    app.get('/checkforaddreview', HomeController.isLoggedIn, HomeController.checkForAddReviewPage);
    app.get('/getEditReviewDetail', HomeController.isLoggedIn, HomeController.getEditReviewDetailPage);
    app.get('/business',ListingController.isLoggedIn, ListingController.showBusinessHomePage);
    app.post('/postreply',ListingController.postReplyPage);
    app.get('/myclaimedroperties', ListingController.isLoggedIn, ListingController.showClaimPendingProperties);
    app.get('/myclaimedlocations', ListingController.isLoggedIn, ListingController.showClaimPendingProperties);
    app.get('/claimproperty', ListingController.isLoggedIn, ListingController.claimProperty);
    app.get('/claimlocation', ListingController.isLoggedIn, ListingController.claimProperty);

    app.get('/unclaimproperty', ListingController.isLoggedIn, ListingController.unclaimProperty);
    app.get('/unclaimlocation', ListingController.isLoggedIn, ListingController.unclaimProperty);
    app.get('/deleteClaim',ListingController.isLoggedIn, ClaimController.removeClaim);
    app.post('/location-api', apiController.getProperty);
    //app.get('/blogs', BlogController.showBlogsPage);
    //app.get('/blog', BlogController.showSingleBlogPage);
    app.get('/blogs', BlogsController.showBlogsPage);
    app.get('/blog', BlogsController.showSingleBlogPage);
    app.post('/checkforemail', HomeController.checkForEmailPage);
    
    app.get('/errorpage',function(req,res){
        res.render('errorpage',{
            error : req.flash("error"),
            success: req.flash("success"),
            session:req.session
        });
    });

    app.get('/ip',function(req, res) {
      where.is('192.168.137.22', function(err, result) {
        req.geoip = result;
        console.log(req.geoip);
      });
    });

    /* Admin Routes */
    app.post('/admin/login', passport.authenticate('admin-login',{
        successRedirect: '/admin/home',
        failureRedirect: '/admin/login',
        failureFlash: true
    }));
    app.get('/admin/logout', AdminHomeController.logout);
    app.get('/admin', AdminHomeController.loggedIn, AdminHomeController.home);//home home
    app.get('/admin/login', AdminHomeController.login);
    app.get('/admin/home', AdminHomeController.loggedIn, AdminHomeController.home);
    app.get('/admin/users', AdminHomeController.loggedIn, AdminHomeController.allUsers);
    app.get('/admin/business-users',AdminHomeController.loggedIn, AdminHomeController.allBusinessUsers);
    app.get('/admin/businessuser/approve', AdminHomeController.loggedIn, AdminHomeController.approveBusinessUser);
    app.get('/admin/businessuser/activate', AdminHomeController.loggedIn, AdminHomeController.activateBusinessUser);
    app.get('/admin/businessuser/suspend', AdminHomeController.loggedIn, AdminHomeController.suspendBusinessUser);
    app.get('/admin/userdetails',AdminHomeController.loggedIn, AdminHomeController.getUserDetails);
    app.get('/admin/categories', AdminHomeController.loggedIn, AdminHomeController.allCategories);
    app.get('/admin/addcategory', AdminHomeController.loggedIn,CategoryController.addCategoryPage);
    app.post('/admin/category/store', AdminHomeController.loggedIn, CategoryController.storeCategoryPage);
    app.post('/admin/category/update', AdminHomeController.loggedIn, CategoryController.updateCategoryPage);
    app.post('/admin/updateCategory', AdminHomeController.loggedIn, CategoryController.updateCategoryPage);
    app.get('/admin/editcategory', AdminHomeController.loggedIn, CategoryController.editCategoryPage);
    app.get('/admin/deletecategory', AdminHomeController.loggedIn, CategoryController.deleteCategoryPage);    
    app.get('/admin/locations', LocationController.allProperties);
    app.get('/admin/approve-location', AdminHomeController.loggedIn, LocationController.approveLocation);
    app.get('/admin/reject-location',AdminHomeController.loggedIn, LocationController.rejectLocation);
    app.get('/admin/location-detail', AdminHomeController.loggedIn, LocationController.getDetailLocation);
    app.get('/admin/business-lists',AdminHomeController.loggedIn, BusinessController.getAllBusiness);
    app.get('/admin/business-detail',AdminHomeController.loggedIn, AdminHomeController.getBusinessUserDetails);
    app.get('/admin/reviews',AdminHomeController.loggedIn, ReviewController.getAllReviews);
    app.get('/admin/reviews/:reviewId',AdminHomeController.loggedIn, ReviewController.getAllReviewsById);
    app.get('/admin/users/approve', AdminHomeController.loggedIn, AdminHomeController.approveUser);
    app.get('/admin/users/suspend', AdminHomeController.loggedIn, AdminHomeController.suspendUser);
    app.get('/admin/claimed-locations', AdminHomeController.loggedIn, ClaimController.getClaimedLocations);
    app.get('/admin/approve-claim', AdminHomeController.loggedIn, ClaimController.approvClaim);
    app.get('/admin/ignore-claim', AdminHomeController.loggedIn, ClaimController.ignoreClaim);
    app.get('/admin/flagged-reviews', AdminHomeController.loggedIn, ReviewController.getAllFlaggedReviews);
    app.get('/admin/blogs', AdminHomeController.loggedIn, BlogsController.allblogs);
    app.get('/admin/addblog', AdminHomeController.loggedIn, BlogsController.addblogPage);
    app.post('/admin/storeblogs',upload.single('blog_image'), BlogsController.storeblogs);
    app.get('/admin/editblog', AdminHomeController.loggedIn, BlogsController.editblogPage);
    app.post('/admin/updateblog',upload.single('blog_image'), BlogsController.updateblogPage);
    app.get('/admin/deleteblog', AdminHomeController.loggedIn, BlogsController.deleteblogPage);
    app.get('/admin/emails', AdminHomeController.loggedIn, EmailController.showemails);
    app.get('/admin/addemail', AdminHomeController.loggedIn, EmailController.addemailPage);
    app.post('/admin/storeemail', EmailController.storeemail);
    app.get('/admin/editemail', AdminHomeController.loggedIn, EmailController.editemailPage);
    app.post('/admin/updateemail', EmailController.updateemailPage);
    app.get('/admin/deleteemail', AdminHomeController.loggedIn, EmailController.deleteemailPage);


    /*Adminside Ajax routes*/
    app.post('/admin/review/deleteReview', AdminHomeController.loggedIn, ReviewController.deleteReviewById);
    app.post('/admin/review/manageLike', ReviewController.manageLike);
    app.post('/admin/review/manageFlag', ReviewController.manageFlag);
    app.post('/admin/review/cancelFlaggedReview', ReviewController.cancelFlaggedReview);
    app.post('/admin/review/removeReviewReply', ReviewController.removeReviewReply);
    app.post('/admin/setprofesstionalbadge', AdminHomeController.loggedIn, HomeController.setProfesstionalBadge);    

    /*Newly Added routes*/
    app.get('/user/:userid/profile', HomeController.showUserProfile);
    app.get('/business-memberships', HomeController.isLoggedIn, BusinessController.getMembershipData);
    app.get('/business-plans/:plan_id/purchase',HomeController.isLoggedIn, BusinessController.purchaseMembershipPlan);
    app.get('/buy-token',HomeController.isLoggedIn, BusinessController.buyTokens);
    app.get('/location/:slug/details', HomeController.showPropertyDetailPage);
    app.get('/user-memberships', HomeController.isLoggedIn, HomeController.showUserMembership);
}
/*    
app.post('/admin/login', function (req, res) {
    res.send('POST request to the homepage')
});
*/
function usernameToLowerCase(req, res, next){
    req.body.email = req.body.email.toLowerCase();
    next();
}
