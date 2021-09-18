var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var productHelpers = require('../helpers/product-helpers')
var fs = require('fs');
var db = require("../config/connection");
var collection = require('../config/collections')

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.adminLoggedIn) {
    res.redirect('/admin/home')
  }
  else {
    if (req.session.adminLoggedAttempt) {
      res.render('admin/index', { errorMessage: "User not fount" });
    }
    else {
      res.render('admin/index')
    }
  }
});


/* Admin login */
router.post('/admin-login', (req, res) => {
  userHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true
      res.redirect('/admin/home')
    }
    else {
      req.session.adminLoggedAttempt = true
      res.redirect('/admin/')
    }
  })
})


/* Admin Home Page */
router.get('/home', function (req, res) {
  res.render('admin/home', { admin: true });
});


/* Admin product list page */
router.get('/products', function (req, res) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/products', { products, admin: true });
  })
});


/* Admin Add product page */
router.get('/add-product', (req, res) => {
  productHelpers.getCategoryAndSubCategory().then((categories) => {
    res.render('admin/add-product', { admin: true, categories })
  })

})

/* Admin product upload */
router.post('/addproduct', (req, res) => {
  productHelpers.addProduct(req.body).then((id) => {
    console.log();
    let image = req.files.image
    let image2 = req.files.image2
    let image3 = req.files.image3
    let image4 = req.files.image4
    console.log(image+"---------"+image2+"____________"+image3+"----------"+image4);
    image.mv('./public/product-images/image1/' + id + '.png')
    image2.mv('./public/product-images/image2/' + id + '.png')
    image3.mv('./public/product-images/image3/' + id + '.png')
    image4.mv('./public/product-images/image4/' + id + '.png')
    res.redirect('/admin/add-product')
  })
})


/* Admin view Userlist */
router.get('/users', (req, res) => {
  userHelpers.getAllUsers().then((data) => {
    res.render('admin/users', { data, admin: true })
  })
})


/* Admin view banner */
router.get('/add-banner', (req, res) => {
  productHelpers.getBannerImage().then((banner) => {
    res.render('admin/add-banner', { banner, admin: true })
  })
})


/* Admin update banner image */
router.post('/add-banner', (req, res) => {
  productHelpers.addBanner(req.body).then((id) => {
    let image = req.files.image
    image.mv('./public/banner/' + id + '.jpg', (err, data) => {
      if (!err) {
        res.redirect('/admin/add-banner')
      }
      else {
        console.log(err);
      }
    })
  })
})

/* Admin Delete banner */
router.get('/delete-banner/:id', (req, res) => {
  let id = req.params.id
  productHelpers.deleteBanner(id).then(() => {
    var filePath = './public/banner/' + id + '.jpg';
    fs.unlinkSync(filePath);
    res.redirect('/admin/add-banner')
  })
})


/* Admin can Delete Product */
router.get("/delete-product/:id", (req, res) => {
  let id = req.params.id
  productHelpers.deleteProduct(id).then(() => {
    fs.unlinkSync('./public/product-images/' + id + '.png')
    res.redirect('/admin/products')
  })
})


/* Admin view edit product */
router.get('/edit-product/:id', (req, res) => {
  let id = req.params.id
  productHelpers.viewProduct(id).then((result) => {
    if (result) {
      res.render('admin/edit-product', { result, admin: true })
    }
  })
})

/* Admin can have edit product item */
router.post('/edit-product/:id', (req, res) => {
  let id = req.params.id
  let data = req.body
  let image = req.files.image
  productHelpers.editProductItem(id, data).then(() => {
    image.mv('./public/product-images/image1/' + id + '.png')
    res.redirect('/admin/products')
  })
})


/* Admin can block and unblock user */
router.get("/status/", (req, res) => {
  let id = req.query.id
  let status = req.query.status
  userHelpers.blockUser(id, status).then(() => {
    res.redirect('/admin/users')
  })
})


/* Get category page */
router.get('/category', (req, res) => {
  productHelpers.getAllCategory().then((categories) => {
    res.render('admin/category', { admin: true, categories })
  })
})

/* Create category */
router.post('/create-category', (req, res) => {
  let data = req.body
  console.log(data);
  productHelpers.createCategory(data).then(() => {
    res.redirect('/admin/category')
  })
})

// Delete category
router.get('/delete-category', (req, res) => {
  let id = req.query.id
  productHelpers.deleteCategory(id).then(() => {
    res.redirect('/admin/category')
  })
})

// Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/')
})

// Get sub category
router.get('/subCategory/:categoryName',(req,res)=>{
  let categoryName = req.params.categoryName
  productHelpers.getsubCategory(categoryName).then((subCategory)=>{
    res.json(subCategory)
  })
})

// Delete subcategory
router.get('/delete-subCategory',(req,res)=>{
  let subCategory = req.query.id
  let category = req.query.category
  productHelpers.deleteSubCategory(subCategory,category).then(()=>{
    res.redirect('/admin/category')
  })
})

// Get Brands logo
router.get('/companies',async(req,res)=>{
  let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
  res.render('admin/companies',{admin:true, brand })
})

// Add Brand 
router.post('/add-brand',(req,res)=>{
  productHelpers.addBrand(req.body).then((id)=>{
    let image = req.files.image
    image.mv('./public/brand/' + id + '.jpg')
    res.redirect('/admin/companies')
  })
})

// Delete brand
router.get('/delete-company',async (req,res)=>{
  let id = req.query.id
  await productHelpers.deleteBrand(id)
  res.redirect('/admin/companies')
})






module.exports = router;
