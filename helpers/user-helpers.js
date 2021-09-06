
var db = require('../config/connection')
const objectId = require('mongodb').ObjectId
var collection = require('../config/collections')

module.exports = {
    doRegister: (userData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then(async (userCheck) => {
                if (userCheck) {
                    resolve(false)
                }
                else {
                    var result = await db.get().collection(collection.USER_COLLECTION).insertOne(userData)
                    var user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: result.insertedId })
                    resolve(user)
                }
            })
        })
    },

    userLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {

                if (user.password == userData.password) {
                    response.status = true
                    resolve(response)
                }
                else {
                    response.status = false
                    resolve(response)
                }
            } else {
                response.status = false
                resolve(response)
            }
        })
    },

    adminLogin:(userData)=>{
        return new Promise(async (resolve, reject) => {
            let data = {}
            let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: userData.email })
            if (user) {
                if (user.password == userData.password) {
                    data.status = true
                    resolve(data)
                }
                else {
                    data.response = false
                    resolve(data)
                }
            }
            else {
                data.status = false
                resolve(data)
            }
        })
    },


    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let user = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    }


}