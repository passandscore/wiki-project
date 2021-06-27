//Dependancies
const config = require("config");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const fs = require('fs');
const path = require('path');


//Remote files
const dbURI = config.get("MONGO_URI");
const PORT = config.get("PORT") || 3000;
const articleRoutes = require("./routes/articles");
const authRoutes = require("./routes/auth");
const User = require('./models/User');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs.log'),{flags:'a'});


//express app
const app = express();

//Register view Engine
app.engine(
  "hbs",
  handlebars({
    extname: ".hbs",
    partialDir: __dirname + "/views/partials",
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");


// Setting up session middleware
const store = new MongoDBStore({
  uri: dbURI,
  collection: "sessions",
});

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


//Static files
app.use(express.static("public"));


//Middleware
app.use(express.json()); //Applies form data to the req.body
app.use(morgan("dev",{stream:accessLogStream})); //displays error messages in the console with options.
app.use(bodyParser.urlencoded({ extended: false })); //Applies form data to the req.body
app.use(flash());


//Check if user is currently logged into the session
app.use((req, res, next)=>{
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id).then(user=>{
    req.user = user; //store user locally
    next();
  })
})


// Use Local variables 
app.use((req, res, next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn;

  if(res.locals.isAuthenticated){
  res.locals.username = req.session.user.username
  }

  res.locals.errorMessage = req.flash('error');
  res.locals.successMessage = req.flash('success');
  next();
})


//Routes
app.use(articleRoutes);
app.use(authRoutes);
app.use((req, res, next)=>{
  res.render('404.hbs')
});


// Express error handling
app.use((error, req, res, next)=>{
  res.render('500.hbs', {error});
})


// Connecting to db and run the server
mongoose
  .connect(dbURI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT);
    console.log(`Connected to DB & listening on port ${PORT}`);
  })
  .catch((err) => console.error(err.message));
