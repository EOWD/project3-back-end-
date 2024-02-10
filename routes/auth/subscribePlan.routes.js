const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../../models/User.model");
const router= express.Router()


router.post('/subscribe', async (req,res)=>{

const userId = await req.body.id
const amountOfTokens = await req.body.plan
let success = false;

// payment method logic



// update tokens logic
 success = true;
try{
const newTokens= +amountOfTokens

const user= await User.findById(userId)
let{tokens}= user

console.log(tokens)
if (success){
    tokens += newTokens
    console.log(tokens)
const updateUser= await User.updateOne({_id:userId},{tokens:tokens})
res.send({status:"success"})

}}catch(err){
console.log(err)
    res.send({status:"failed"})

}

})

module.exports = router 