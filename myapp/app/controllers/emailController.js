var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var request     = require('request');
var constants = require('../../config/constants'); 
var bodyParser = require('body-parser');
var Email     = require('../../app/models/email');

exports.addemailPage = function(req,res){
    res.render('admin/addemail.ejs', {
        error : req.flash("error"),
        success: req.flash("success"),
        session:req.session,
        email:'',
    });
}

exports.showemails = function(req,res){
    Email.find({}, function(err, emails) {
        /*var emailList = [];      
        emails.forEach(function(email) {
          emailList.push(emails);
        });*/
        res.render('admin/emails.ejs', {
            error : req.flash("error"),
            success: req.flash("success"),
            emailsList: emails,
        });
    });
}

exports.editemailPage = function(req, res) {
        var e_id = req.param('edit');
        Email.findOne({ 'id' :  e_id}, function(err, email){
            if(err){
                req.flash('error', 'Error : something is wrong while edit email');
                res.redirect('/errorpage');
            }else{              
                console.log(email);
                res.render('admin/addemail', {
                    error : req.flash("error"),
                    success: req.flash("success"),
                    session:req.session,
                    email:email,
                });
            }
    });
}
/*Code for Update Blog*/
exports.updateemailPage = function(req, res) {
    Email.findOne({id:req.body.email_id}, function(err, emil) {
        if(err){
            req.flash('error', 'Error : something is wrong while updating email');
            res.redirect('/errorpage');
        }
        else{
            if(emil){

                emil.category_name = req.body.category_name;

                var day = getDate();
                emil.email_name = req.body.email_name;
                emil.email_keys = req.body.email_keys;
                emil.email_subject = req.body.email_subject;
                emil.email_message = req.body.email_message; 
                emil.updated_date = day;
                emil.save(function(err) {
                if (err)  return (err);                
                    req.flash('success', 'Email Template updated successfully.');
                    res.redirect('/admin/emails');
                });            
            }
        }                 
    });     
}

/*Code for Delete Blog*/
exports.deleteemailPage = function(req, res) {
    e_id = req.param('delete');
    console.log(e_id);    
    Email.findOne({id:e_id}, function(err, emil) {
        if(err){
            req.flash('error', 'Error : something is wrong while delete email');
            res.redirect('/errorpage');
        }
        if (emil){

            Email.deleteOne({ 'id' :  e_id}, function(err){
                req.flash('success', 'Email Template deleted successfully.');
                res.redirect('/admin/emails');
            });
        }
    });
}

/*Code for Add new Blog*/
exports.storeemail = function(req, res) {

    if(((req.body.email_name.trim()).length)==0 || ((req.body.email_subject.trim()).length)==0){

        console.log('something blank');
        req.flash('error', 'Please fill proper details');
        res.redirect('/admin/emails');
    }
    else{
        console.log('filled');

        Email.find().sort([['id', 'descending']]).limit(1).exec(function(err, emaildata) {
            var newEmail = new Email();
            var day = getDate();
            newEmail.email_name = req.body.email_name;
            newEmail.email_keys = req.body.email_keys;
            newEmail.email_subject = req.body.email_subject;
            newEmail.email_message = req.body.email_message; 
            newEmail.created_date = day;
            newEmail.updated_date = day;

            if(emaildata.length>0){
                newEmail.id = emaildata[0].id+1;
                newEmail.email_type = emaildata[0].id+1;
            }else{
                newEmail.email_type = 1;
            }

            newEmail.save(function(err) {
            if (err)  return (err);                
                req.flash('success', 'Email added successfully.');
                res.redirect('/admin/emails');
            });
        }); 
    }
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