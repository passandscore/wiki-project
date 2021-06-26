const Article = require("../models/Article");
const User = require("../models/User");
const { validationResult } = require('express-validator');


exports.getHome = (req, res) => {
  Article.find({}).lean().sort({createdAt: -1}).then((articles) => {

      // SEARCH MODE
       if(req.query.search && req.user){

        articles = articles.filter(article => {
          if(article.title.toLowerCase().includes(req.query.search.toLowerCase())){
            return {title: article.title, description: article.description } 
          }})
      
        if(articles.length ==0) {
           req.flash('error', 'No results found');
          return res.redirect('/')
        }

       } else {

      //HOME MODE
      //Constrain find to 3 documents
      articles = articles.slice(0,3);

      //Only display the first 50 words of the description
      articles = articles.map(doc => {  
      let description = doc.description.split(' ').slice(0,50).join(' ');
      return {title: doc.title, description: description }
          })
      }

      //Determine if article array is empty
      const articleSize = articles.length;

      // render
      res.render("index.hbs", { docTitle: "Home Page", articles, articleSize });
  });
};

exports.getAllArticles = (req, res) => {
  console.log('ALL ARTICLES');

  Article.find({}).lean().sort({title: 1}).then((articles) => {

    //Determine if article array is empty
    const articleSize = articles.length;

  res.render('all-articles', {articles, articleSize})

})

}

exports.getCreate = async (req, res) => {
console.log('CREATE ARTICLE');
const articleId = req.params.id;
let editMode = false;

  if(articleId){ 
    //EDIT MODE
    editMode = true;
    let article = await Article.findById(articleId).lean();
    res.render("create", {
      title: article.title,
      description: article.description,
      articleId: article._id,
      docTitle: "Edit Article",
      editMode});
  } else {
    //CREATE MODE
    res.render('create', {docTitle: "Create Article", editMode})
  }

} 

exports.postCreate = async (req, res, next)=>{
  console.log('POST CREATE')
  let {title, description, id} = req.body;
  
  //Capitalize the first letter of the title for proper sorting
  title = title[0].toUpperCase() + title.slice(1);

  //Collect the errors array
  const errors = validationResult(req);

  // if there is errors 
  if(!errors.isEmpty()){
    console.log('errors' + errors)
    req.flash('error',  errors.array()[0].msg);
    return res.render('create', {
      docTitle:'Create', 
      title: title,
      description: description,
      articleId: id,
      docTitle: "Create Article",
      errorMessage: errors.array()[0].msg
    })
  }

  
  try{

    //course Id exists
    if(id){
    
    //EDIT MODE
    await Article.findByIdAndUpdate(
      { _id: id },
      { title, description},
    );
     req.flash('success', 'Article successfully edited.');
     res.redirect('/')
    
    } else {

    //CREATE MODE
    // check my db if the title exists 
    let article = await Article.findOne({title: title})
      if(article){
        req.flash('error', 'This title already exists in the database');
        return res.redirect('create')
      }

    const userData = {title, description, author: req.user._id}
    const newArticle = await Article.create(new Article(userData))

    //Add article to users created articles array
    await User.updateOne(
      { _id:req.user._id},
      { $push: { createdArticles: newArticle._id.toString()} }
    );
      req.flash('success', 'Article created successfully')
      res.redirect('/');
    }  

  }catch(err){
  next(err)
  }
}


exports.getDetails = (req, res, next)=>{
  console.log('DETAILS')
  console.log(req.user)
  const title = req.params.title;

  Article.find({title}).then(article=>{
    article = article[0];
    let owner = false;

    // If a user is logged in 
    if(req.user){
        owner = req.user._id == article.author;
    }

    res.render('article', 
    {docTitle:`Details | ${title}`,
    title: article.title,
    description: article.description,
    id:article._id.toString(),
    owner});
  }).catch(error=>{
      next(error)
  })
}

exports.getDelete = async(req, res)=>{
  console.log('DELETE');
  const courseId = req.params.id;
  const userId = req.user;

  // const article = await Article.find({courseId});

  try{
   if (userId.createdArticles.includes(courseId)) {
      //Remove article from author array.
      await User.updateOne(
        { _id: userId },
        { $pull: { createdArticles: courseId } }
      )};

    //Delete the article
    await Article.findByIdAndDelete(courseId)
      req.flash('success', 'Article successfully deleted.')
      res.redirect("/");
    }catch(err){
      next(err)
    }  
}

