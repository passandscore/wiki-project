const express = require("express");
const route = express.Router();
const articleCtrl = require("../controllers/articleCtrl");
const { isAuth }= require('../middleware/isAuth');
const {createValidator} = require('../validation/article-validation');



route.get("/", articleCtrl.getHome);
route.get("/all-articles", articleCtrl.getAllArticles);
route.get("/create/:id", isAuth, articleCtrl.getCreate);
route.get("/create", isAuth, articleCtrl.getCreate);
route.post("/create", createValidator(), articleCtrl.postCreate);
route.get("/article/:title", articleCtrl.getDetails);
route.get("/delete/:id", isAuth, articleCtrl.getDelete);



module.exports = route;
