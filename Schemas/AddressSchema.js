const {Schema} = require('mongoose');
const User=require("../models/AddressModel");
const AddressSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    address1:{
        type:String,
        required:true
    },
    address2:{
        type:String,
        required:true
    },
    phonenumber:{
        type:Number,
        required:true
    },
    relation:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    occupation:{
        type:String,
        required:true
    },
    socialmedia:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});
module.exports = AddressSchema;