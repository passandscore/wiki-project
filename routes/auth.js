const express = require("express");
const route = express.Router();
const authCtrl = require("../controllers/authCtrl");
const {loginValidator, signupValidator} = require('../validation/auth-validation');


route.get("/register", authCtrl.getRegister);
route.post("/register", signupValidator(), authCtrl.postRegister);
route.get("/login", authCtrl.getlogin);
route.post("/login", loginValidator(), authCtrl.postLogin);
route.get("/logout", authCtrl.getLogout);

module.exports = route;
