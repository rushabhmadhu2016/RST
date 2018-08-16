var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var request     = require('request');
var constants = require('../../config/constants'); 

/*Code for Show Mail Blog Page*/
exports.showBlogsPage = function(req, res){
    var per_page=5;
    var page=1;

    if(req.query.page){
        if(IsNumeric(req.query.page)){
            page = parseInt(req.query.page);
        }else{
            req.flash('error', 'Invalid param page alpha in Blogs Page');
            res.redirect('/error');
        }
    }

    var url=constants.blog_url+'?per_page='+per_page+'&&page='+page;

    console.log(url);
    var postImages = [];
    var posts=[];
    req.session.postImages = postImages;
    request(url, function(err, resp, body) {
        bodyData = JSON.parse(body);
        if(isArray(bodyData)==true){
            bodyData.forEach(function(post){
                posts.push(post);        
            });
            
            totalPost = resp.headers['x-wp-total'];
            totalPage = resp.headers['x-wp-totalpages'];
            console.log('totalPost='+totalPost+' totalPage='+totalPage);
            
            res.render('blogs', {
                error : req.flash("error"),
                success: req.flash("success"),
                session:req.session,
                posts: posts,
                postImages: req.session.postImages,
                totalPost:totalPost,
                totalPage:totalPage,
                page:page,
                per_page:per_page,
            });

        }else{
            req.flash('error', 'Invalid param page not_exist in Blogs Page');
            res.redirect('/errorpage');
        }
     });
}

/*Show Single Blog*/
exports.showSingleBlogPage = function(req, res){
    var id = req.query.id;
    if(req.query.id){
        if(IsNumeric(req.query.id)){
            id = parseInt(req.query.id);
        }
    }
    var url=constants.blog_url+id;
    var posts=[];    
    request(url, function(err, resp, body) {
        bodyData = JSON.parse(body);

        var key_data = (Object.keys(bodyData)).join();
        console.log(key_data);
        if((key_data.indexOf('data')) == (-1)){
            /*bodyData.forEach(function(post){            
                posts[post.id]=post;
            });*/
            res.render('blog-detail', {
                error : req.flash("error"),
                success: req.flash("success"),
                session:req.session,
                post: bodyData,
                postImages: req.session.postImages,
            });
        }
        else{
            req.flash('error', 'Invalid param page alpha/notexist_id in Blog Page');
            res.redirect('/errorpage');
        }

     });
}


function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

function isArray(myArray) {
    return myArray.constructor === Array;
} 