
var db = require('../config/connection')
const objectId = require('mongodb').ObjectId
var collection = require('../config/collections')


module.exports = {
    addProduct: (productData) => {
        return new Promise((resolve, reject) => {
            const arr = { ...productData, d: new Date() }
            db.get().collection(collection.PRODUCT_COLLECTION).insert(arr).then((data) => {
                resolve(arr._id)
            })
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    addBanner: (banner) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data) => {
                resolve(data.insertedId)
            })
        })
    },

    getBannerImage: () => {
        return new Promise((resolve, reject) => {
            var banner = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },


    deleteBanner: (banner) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).remove({ _id: objectId(banner) }).then((response)=>{
                resolve(response)
            })
        })
    },


    getBannres:()=>{
        return new Promise((resolve,reject)=>{
            var data = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(data)
        })
        
    }

}