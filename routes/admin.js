var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var productHelpers = require('../helpers/product-helpers')
var fs = require('fs');
const { response } = require('../app');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('admin/index');
});


/* Admin login */
router.post('/admin-login', (req, res) => {
  console.log(req.body);
  userHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      res.redirect('/admin/home')
    }
    else {
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
  res.render('admin/add-product', { admin: true })
})

/* Admin product upload */
router.post('/addproduct', (req, res) => {
  productHelpers.addProduct(req.body).then((id) => {
    console.log();
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.png', (err, data) => {
      if (!err) {
        res.redirect('/admin/add-product')
      }
      else {
        console.log(err);
      }
    })
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
  console.log(id);
  productHelpers.deleteBanner(id).then((response) => {
    var filePath = './public/banner/'+id+'.jpg';
    fs.unlinkSync(filePath);
    res.redirect('/admin/add-banner')
  })
})


module.exports = router;
