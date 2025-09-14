const User = require('../models/User');
const generateToken=require('../utils/generateToken')
const {generateSecret,verifyToken} =require('../utils/twoFactorAuth');

exports.signup=async(req,res)=>{
    const {username,email,password}= req.body;
    const userExistsEmail=await User.findOne({email});
    const userExistsUsername=await User.findOne({username});
    if(userExistsEmail||userExistsUsername){
        res.status(400).json({message:"User Already Exists"})
        return false
    }

    const user = await User.create({
        username,
        email,
        password,
    })
    res.status(201).json({
        _id:user._id,
        username:user.username,
        email:user.email,
        token:generateToken(user._id),
        secret:user.twoFactorAuth
    })
}

exports.login=async(req,res)=>{
    const {email,password,token}= req.body;
    console.log(email,password,token)
    const user=await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        if(user.twoFactorAuth){
            if(verifyToken(user.twoFactorAuthSecret,token)){
                res.json({
                    _id:user._id,
                    username:user.username,
                    email:user.email,
                    token:generateToken(user._id),
                    secret:user.twoFactorAuth
               
                })
            }
            else{
                res.status(401).json({message:'Invalid 2FA token'})
            }
        }
        else{
            res.json({
                _id:user._id,
                username:user.username,
                email:user.email,
                token:generateToken(user._id),
                secret:user.twoFactorAuth
            })
        }
    }
    else{
        res.status(401).json({message:'Invalid Credentails'})
    }
   
}

exports.enableTwoFactorAuth = async (req,res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
        res.status(404).json({message:'User not found'})
        return;
    }
    const secret= generateSecret();
    user.twoFactorAuth=true;
    user.twoFactorAuthSecret=secret.base32;
    await user.save();
    res.json({
        message:'Two-factor authentication is enabled',
        secret:secret.otpauth_url
    })


}