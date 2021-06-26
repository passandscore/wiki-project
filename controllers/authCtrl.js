const User = require("../models/User");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');




exports.getRegister = (req,res) => {
res.render('auth/register', {})
}

exports.postRegister = (req, res)=>{

  const password = req.body.password
  const username = req.body.username;
  const errors = validationResult(req);


    if(!errors.isEmpty()){
        console.log(errors)
      return res.render('auth/register', {
        docTitle:'Sign up ', 
        errorMessage: errors.array()[0].msg
      })
    }
  
   bcrypt.hash(password, 12).then(hash => {
      const user = new User({username, password:hash });
      return user.save()
      }).then(result=>{
        console.log(result)
         req.flash('success', 'Registration successfully');
        res.redirect('login'); 
    }).then(result=> {
      console.log(result)
    }).catch(err=> console.log(err));
}


exports.getlogin = (req, res) => {
res.render('auth/login', {docTitle:'Login'});
}

exports.postLogin = (req, res)=>{
 const password = req.body.password;
  const username = req.body.username;

  const errors = validationResult(req);

  // if there is errors 
  if(!errors.isEmpty()){
    return res.render('auth/login', {
      docTitle:'Login', 
      errorMessage: errors.array()[0].msg
    })
  }

  // check my db if the username exists 

  User.findOne({username: username}).then(user=>{
    //b. false: message invalid username or password => /login 
    if(!user){
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login')
    }

    //1. true: compare the password he entered with the password hash stored in the db 
    bcrypt.compare(password, user.password).then(match=>{

      if(match){
        // a. true: store in session 'isLoggedIn: true',  req.session.user
        req.session.isLoggedIn = true;
        req.session.user = user;
        // Store the session in db
        return req.session.save((err)=>{
          console.log(err);
          req.flash('success', 'LoggedIn successfully');
          res.redirect('/')
        })
      }
     // b. false: message invalid username or password => /login 
     req.flash('error', 'Invalid username or password');
     return res.redirect('/login')
    })
  }).catch(err=> {
    console.log(err);
    res.redirect('/login');
  })

}

exports.getLogout = (req, res)=>{
  req.flash('success', 'Logged out successfully')
  req.session.destroy( err=>{
    res.redirect('/')
  })
}