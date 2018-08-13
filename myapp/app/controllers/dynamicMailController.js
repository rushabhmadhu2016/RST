var numeral 	= require('numeral');
var bcrypt 		= require('bcrypt-nodejs');
var dateFormat  = require('dateformat');
var fs          = require('fs');
var request     = require('request');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var constants = require('../../config/constants'); 
var bodyParser = require('body-parser');
var Email     = require('../../app/models/email');
var emailtemplate = require('../../lib/forgotpassword.js');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'innvonix2016@gmail.com',
        pass: 'zcutblndftsrqbfl'
      }
}));

exports.sendMail = function(data) {
	console.log(data);
	var email_type = data.email_type;
	Email.findOne({id:email_type},function(err, emailData){
		if(err){
			req.flash('error', 'Error : something is wrong while sending email');
            res.redirect('/errorpage');
		}
		else{
			if(emailData){
				$template_type = parseInt(emailData.email_type);
				switch ($template_type) {
				    case 0:
				    	console.log('switch case 0');
				        break;
				    case 1:
				    	console.log(emailData);
				    	console.log('forgot password mail');
				        break;
				    default:
				    	console.log('default switch case');
				        break;
				}
				console.log('switch case over');
				var email_data = ''+emailData.email_message+'';
				console.log(email_data);
				const mailOptions = {
			      from: 'innvonix2016@gmail.com', // sender address
			      to: data.receiver_email, // list of receivers
			      subject: emailData.email_subject, // Subject line
			      html: email_data
				};
				
				transporter.sendMail(mailOptions, function (err, info) {
			   		if(err)
			     		console.log(err)
			   		else
			     		console.log(info);
				});
			}
		}
	})
}