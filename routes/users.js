var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getBannres().then((data)=>{
    res.render('user/index',{user:true,data});
  })
});

router.get('/login',(req,res)=>{
  res.render('user/login-register',{user:true})
})

router.post('/login', (req, res) => {
  userHelpers.userLogin(req.body).then((response) => {
    if (response.status) {
      res.redirect('/')
    }
    else {
      res.redirect('/login')
    }
  })
})

router.post('/register',(req,res)=>{
  userHelpers.doRegister(req.body).then((result) => {
    if (!result) {
      res.redirect("/login")
    } else {
      res.redirect('/')
    }
  })
})

module.exports = router;
