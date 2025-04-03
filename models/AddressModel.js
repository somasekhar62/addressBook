const {model}=require('mongoose');
const AddressSchema=require('../Schemas/AddressSchema');
const AddressModel= model('Address',AddressSchema);
module.exports=AddressModel;