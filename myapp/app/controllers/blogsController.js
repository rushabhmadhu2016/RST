var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var request     = require('request');
var constants = require('../../config/constants'); 
var bodyParser = require('body-parser');
var Blog     = require('../../app/models/blog');

exports.addblogPage = function(req,res){
    res.render('admin/addblogs.ejs', {
        error : req.flash("error"),
        success: req.flash("success"),
        session:req.session,
        blog:'',
    });
}

exports.allblogs = function(req,res){
    Blog.find({}, function(err, blogs) {
        var blogList = [];      
        blogs.forEach(function(blog) {
          blogList.push(blog);
        });
        res.render('admin/blogs.ejs', {
            error : req.flash("error"),
            success: req.flash("success"),
            blogs: blogList,
        });
    });
}

exports.editblogPage = function(req, res) {
        var blog_id = req.param('edit');
        Blog.findOne({ 'id' :  blog_id}, function(err, blog){
            if(err){
                req.flash('error', 'Error : something is wrong while edit blog');
                res.redirect('/errorpage');
            }else{              
                console.log(blog);
                res.render('admin/addblogs', {
                    error : req.flash("error"),
                    success: req.flash("success"),
                    session:req.session,
                    blog:blog,
                });
            }
    });
}
/*Code for Update Blog*/
exports.updateblogPage = function(req, res) {
    Blog.findOne({id:req.body.blog_id}, function(err, blog) {
        if(err){
            req.flash('error', 'Error : something is wrong while updating blog');
            res.redirect('/errorpage');
        }
        else{
            if(blog){

            if(req.file){
                if(fs.existsSync('public/uploads/'+req.body.old_image)){
                    fs.unlink('public/uploads/'+req.body.old_image, (err) => {
                        if (err){
                            console.log('File delete error');
                        }else{
                            console.log('File deleted!');
                        }
                    });
                }
            }

                var blogimage = '';
                if(req.file){
                    blogimage = req.file.filename;
                }else{
                        if(req.body.db_records==1){
                            blogimage = req.body.old_image
                        }else{
                            if(fs.existsSync('public/uploads/'+req.body.old_image)){
                                fs.unlink('public/uploads/'+req.body.old_image, (err) => {
                                    if (err){
                                        console.log('File delete error');
                                    }else{
                                        console.log('File deleted!');
                                    }
                                });
                            }
                            blogimage = '';
                        }
                }
                
                console.log('blog');
                blog.category_name = req.body.category_name;

                var day = getDate();
                blog.blog_title = req.body.blog_title;
                blog.blog_content = req.body.blog_content; 
                blog.blog_image = blogimage;
                blog.updated_date = day;
                blog.save(function(err) {
                if (err)  return (err);                
                    req.flash('success', 'Blog updated successfully.');
                    res.redirect('/admin/blogs');
                });            
            }
        }                 
    });     
}

/*Code for Delete Blog*/
exports.deleteblogPage = function(req, res) {
    blog_id = req.param('delete');
    console.log(blog_id);    
    Blog.findOne({id:blog_id}, function(err, blog) {
        if(err){
            req.flash('error', 'Error : something is wrong while delete blog');
            res.redirect('/errorpage');
        }
        if (blog){

            if(fs.existsSync('public/uploads/'+blog.blog_image)){
                fs.unlink('public/uploads/'+blog.blog_image, (err) => {
                  if (err){
                    console.log('File delete error');
                  }else{
                    console.log('File deleted!');
                  }
                });
            }

            Blog.deleteOne({ 'id' :  blog_id}, function(err){
                req.flash('success', 'Blog deleted successfully.');
                res.redirect('/admin/blogs');
            });
        }
    });
}

/*Code for Add new Blog*/
exports.storeblogs = function(req, res) {
    if(((req.body.blog_title.trim()).length)==0 || ((req.body.blog_content.trim()).length)==0){

        if(req.file){
            blogimage = req.file.filename
            if(fs.existsSync('public/uploads/'+blogimage)){
                fs.unlink('public/uploads/'+blogimage, (err) => {
                  if (err){
                    console.log('File delete error');
                  }else{
                    console.log('File deleted!');
                  }
                });
            }
        }

        console.log('something blank');
        req.flash('error', 'Please fill proper details');
        res.redirect('/admin/blogs');
    }
    else{
        console.log('filled');
          var blogimage = '';
        if(req.file){
            blogimage = req.file.filename;
        }

        Blog.find().sort([['id', 'descending']]).limit(1).exec(function(err, blogdata) {
            var newBlog = new Blog();
            var day = getDate();
            newBlog.blog_title = req.body.blog_title;
            newBlog.blog_content = req.body.blog_content; 
            newBlog.blog_image = blogimage;
            newBlog.created_date = day;
            newBlog.updated_date = day;

            if(blogdata.length>0){
                newBlog.id = blogdata[0].id+1;
            }else{
                newBlog.id = 1;
            }

            newBlog.save(function(err) {
            if (err)  return (err);                
                req.flash('success', 'Blog added successfully.');
                res.redirect('/admin/blogs');
            });
        }); 
    }
}

/*Show All Blogs*/
exports.showBlogsPage = function(req, res){
    var page = 0;
    var perPage = 5;
    var counter = 0;    
    if(req.query.page){
        if(IsNumeric(req.query.page)){
            page = req.query.page;
        }else{
            req.flash('error', 'Invalid param page in blog page');
            res.redirect('/errorpage');
        }
    }

    Blog.count({}, function(err, c) {
        counter = c;
        console.log("Total blog Counter = "+c);
        Blog.find({}).limit(perPage).skip(perPage * page).sort({ id: 'desc'}).exec(function(err, blogs) {
            if(err){
                req.flash('error', 'Invalid param page in blog page');
                res.redirect('/errorpage');
            }
            // if(blogs.length==0){
            //     res.redirect('/blogs');
            // }
            var blogList = [];      
            blogs.forEach(function(blog) {
              blogList.push(blog);
            });
            res.render('blogs', {
                session:req.session,
                blogs: blogList,
                page: page,
                counter: counter,
            });
        });
    });
}

/*Show Single Blog in Page*/
exports.showSingleBlogPage = function(req, res){
    var id = '';
    if(req.query.id){
        if(IsNumeric(req.query.id)){
            id = parseInt(req.query.id);
        }
    }

    Blog.findOne({id:id}, function(err, blog) {
        if (!blog){
            res.redirect('/blogs');
        }
        else{
            res.render('blog-detail', {
                session:req.session,
                blog: blog,
            });
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

function getDate(){ 
    return new Date().toLocaleString("en-US", {timeZone: "Europe/London"});
} 