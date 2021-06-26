exports.isAuth = (req, res, next)=>{
  if(req.session.isLoggedIn){
    next()
  }else{
    console.log('Middleware - isAuth: Not logged in')
    res.redirect('/login')
  }
}