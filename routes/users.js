var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')


function logginCheck(req,res,next){
  if(req.session.logged){
    next()
  }
  else{
    res.redirect('/login')
  }
}

/* GET users listing. */
router.get('/', async function (req, res, next) {
  const userEmail = req.session.user
  let cartCount = await productHelpers.getCartCount(userEmail)
  let brand = await productHelpers.getBrand()
  productHelpers.getBannres().then((data) => {
    productHelpers.getProductNewArrival().then((result) => {
      if (req.session.logged) {
        res.render('user/index', { user: true, data, result,  userEmail, cartCount, brand});
      }
      else {
        res.render('user/index', { user: true, data, result, brand });
      }
    })
  })
});




router.get('/login', (req, res) => {
  if (req.session.loggedStatus == false) {
    res.render('user/login-register', { user: true, userBlock: "Admin has blocked you" })
  }
  else {
    if (req.session.loggedAttempt) {
      res.render('user/login-register', { user: true, userBlock: "User not found" })
    }
    else {
      res.render('user/login-register', { user: true})
    }
  }

})

router.post('/login', (req, res) => {
  userHelpers.userLogin(req.body).then((response) => {
    if (response.status) {
      req.session.logged = true
      req.session.user = response.user
      // res.redirect('/')
      res.redirect(req.session.returnTo || '/');
      delete req.session.returnTo;
    }
    else {
      if (response.error == false) {
        req.session.loggedStatus = response.error
        res.redirect('/login')
      }
      else {
        req.session.loggedAttempt = true;
        res.redirect('/login')
      }
    }
  })
})

router.post('/register', (req, res) => {
  userHelpers.doRegister(req.body).then((result) => {
    if (!result) {
      res.redirect("/login")
    } else {
      req.session.logged = true
      req.session.user = result.email
      res.redirect('/')
    }
  })
})

/* User can view product list */
router.get('/shop-left-sidebar', (req, res) => {
  const userEmail = req.session.user
  productHelpers.getAllProductItems().then((products) => {
    req.session.returnTo = req.originalUrl;
    console.log(req.session.returnTo);
    res.render('user/shop-left-sidebar', { products, user: true, userEmail})
  })
})


/* User can view single product item */
router.get('/single-product', (req, res) => {
  let id = req.query.id
  productHelpers.getSingleProductItem(id).then((data) => {
    res.render('user/single-product', { data, user: true })
  })
})

/* User logout the page */
router.get('/logout',(req,res)=>{
  delete req.session.logged
  res.redirect('/')
})

// Add product to cart
router.get('/addToCart/',logginCheck,(req,res)=>{
  console.log("-------------------------------------------------"+req.query.productId);
  let productId = req.query.productId
  const userEmail = req.session.user
  let productPrice = req.query.productPrice
  console.log(productPrice+"------------------------------------------------------------------");
  productHelpers.addToCartPage(productId,userEmail,productPrice).then(()=>{
    res.redirect("/cart")
  })
})

// Get Cart page
router.get('/cart',logginCheck,(req,res)=>{
  const userEmail = req.session.user
  productHelpers.getAllCartItems(userEmail).then(async (userCartData)=>{
    let total = await productHelpers.getSubTotatl(userEmail)
    req.session.cartTotal =total 
    req.session.userCartItem = userCartData
    res.render('user/cart',{user:true, userCartData, userEmail, total })
  })
})

// Delete Cart item
router.get('/deleteCartItem',(req,res)=>{
  let id = req.query.id
  let proId = req.query.proId
  productHelpers.deleteCartItem(id,proId).then(()=>{
    res.redirect('/cart')
  })
})

// Change product quantity
router.post('/change-product-quantity',(req,res)=>{
  productHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
})

// Get checkout page
router.get('/checkout',logginCheck,(req,res)=>{
  const userEmail = req.session.user
  res.render('user/checkout',{user:true, userEmail })
})



module.exports = router;
