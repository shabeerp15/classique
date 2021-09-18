var db = require("../config/connection");
const objectId = require("mongodb").ObjectId;
var collection = require("../config/collections");

module.exports = {
  addProduct: (productData) => {
    return new Promise((resolve, reject) => {
      const arr = { ...productData, date: new Date() };
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .insert(arr)
        .then((data) => {
          resolve(arr._id);
        });
    });
  },

  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  addBanner: (banner) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .insertOne(banner)
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },

  getBannerImage: () => {
    return new Promise((resolve, reject) => {
      var banner = db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banner);
    });
  },

  deleteBanner: (banner) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .remove({ _id: objectId(banner) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  getBannres: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },

  getProductNewArrival: () => {
    return new Promise((resolve, reject) => {
      var res = db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .limit(2)
        .toArray();
      resolve(res);
    });
  },

  deleteProduct: (product) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(product) });
      resolve();
    });
  },

  viewProduct: (product) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(product) })
        .then((result) => {
          resolve(result);
        });
    });
  },

  editProductItem: (productId, productData) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              title: productData.title,
              description: productData.description,
              status: productData.status,
              category: productData.category,
              subCategory: productData.subCategory,
              price: productData.price,
              date: new Date(),
            },
          }
        );
      resolve();
    });
  },

  getAllProductItems: () => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },

  getSingleProductItem: (productId) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(productId) });
      resolve(data);
    });
  },

  createCategory: (data) => {
    let obj = {
      category: data.category,
      subCategory: [data.subCategory]
    }
    return new Promise(async (resolve, reject) => {
      let checkData = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ category: data.category });
      if (checkData) {
        db.get()
          .collection(collection.CATEGORY_COLLECTION)
          .updateOne(
            { category: data.category },
            {
              $addToSet: {
                subCategory: {
                  $each: [data.subCategory],
                },
              },
            }
          );
        resolve();
      } else {
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(obj);
        resolve();
      }
    });
  },

  // get all cateries to categry page
  getAllCategory: () => {
    return new Promise((resolve, reject) => {
      let data = db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },

  // Delete category from category collection
  deleteCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: objectId(categoryId) });
      resolve();
    });
  },

  // get Category and sub category in add product page
  getCategoryAndSubCategory: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(data);
    });
  },

  // Get sub category to add category collection
  getsubCategory: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      var result = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .findOne({ category: categoryName });
      resolve(result.subCategory);
    });
  },

  // Delete sub category
  deleteSubCategory: (subCategory, category) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .updateOne(
          { category: category },
          {
            $pull: {
              subCategory: subCategory,
            },
          }
        );
      resolve();
    });
  },

  // Add product to cart
  addToCartPage: (productId, userEmail, productPrice) => {
    return new Promise(async (resolve, reject) => {
      const proObj = {
        item: objectId(productId),
        quantity: Number(1),
        total: Number(productPrice)
      }
      var user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: userEmail });
      if (user) {
        let proExist = user.products.findIndex(product => product.item == productId)
        if (proExist != -1) {
          await db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': objectId(productId) },
            {
              $inc: {
                'products.$.quantity': 1,
                'products.$.total': proObj.total
              }
            },
          )
          resolve();
        }
        else {
          await db.get().collection(collection.CART_COLLECTION).updateOne(
            { user: userEmail },
            {
              $push: { products: proObj },
            }
          );
          resolve();
        }

      } else {
        let cartObj = {
          user: userEmail,
          products: [proObj],
        };
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
          resolve();
        });
      }
    });
  },

  // // Gell all cart of user
  getAllCartItems: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      var cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: userEmail },
        },
        { $unwind: "$products" },
        {
          $lookup: {
            from: "product",
            localField: "products.item",
            foreignField: "_id",
            as: "productsData",
          },
        },
         { $unwind: "$productsData" }, 
         
        {
          $project: {
            productsData: 1, Quantity: "$products.quantity", Price: "$products.total", 
          }
        }
        
      ])
        .toArray();
      resolve(cartItems);
    });
  },


  getCartCount: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: userEmail })
      if (cart) {
        count = cart.products.length
      }
      resolve(count)
    })
  },

  deleteCartItem: (id, productId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CART_COLLECTION).update({ _id: objectId(id) },
        { $pull: { products: { item: objectId(productId) } } },
      ).then((response) => {
        resolve();
      })
    })
  },

  changeProductQuantity: (data) => {
    let productId = data.product
    let cartId = data.cart
    let count = Number(data.count)
    let price = Number(data.price)
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(cartId), 'products.item': objectId(productId) },
        {
          $inc: { 'products.$.quantity': count, 'products.$.total': price }
        }
      ).then(async () => {
        let getData = await db.get().collection(collection.CART_COLLECTION).findOne({ _id: objectId(cartId), 'products.item': objectId(productId) })
        resolve(getData);
      })
    })
  },

  // { $group: { _id : null, total : { $sum: "$products.total" } } }

  getSubTotatl:(userEmail)=>{
    return new Promise(async(resolve,reject)=>{
      var total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: userEmail },
        },
        { $unwind: "$products" },
        { $group: { _id : null,  total : { $sum: "$products.total" } } },
        { $project: { _id: 0, total: 1 } }
        
      ])
        .toArray();
      resolve(total[0].total);
    })
  },

  // Add brand to brnd collection
  addBrand:(brandData)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.BRAND_COLLECTION).insertOne(brandData).then((data)=>{
        resolve(data.insertedId)
      })
    })
  },

  deleteBrand:(id)=>{
    db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id:objectId(id)})
  },

  // Get brand collection for users
  getBrand:()=>{
    return new Promise((resolve,reject)=>{
      let data = db.get().collection(collection.BRAND_COLLECTION).find().toArray()
      resolve(data)
    })
  }


};
