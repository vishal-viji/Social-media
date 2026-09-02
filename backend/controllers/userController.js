const asyncHandler= require('express-async-handler');
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')
const User = require('../models/User')


// set up multer to upload directly to Cloudinary
// Exported separately so the route file can run this BEFORE the auth check
// (protect), letting the incoming file stream start being consumed
// immediately instead of sitting unread while the auth middleware waits
// on a database call. This fixed an intermittent "Unexpected end of form"
// error on Render for the posts route - applying the same fix here.

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social-media-profile-pictures',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    },
})


const upload = multer({
    storage,
    fileFilter(req,file,cb){
        // Many modern phone cameras save photos as AVIF/WEBP even when the
        // filename still ends in .jpg, so we accept those content types too
        // instead of rejecting a photo that "looks like" a jpg to the user.
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
            'image/avif',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WEBP and AVIF images are allowed.'));
          }
    }
})


// @routes POST /api/users/profile/upload
// NOTE: multer (upload.single) now runs in userRoutes.js BEFORE the `protect`
// auth middleware, so this handler can assume req.file and req.user are
// both already available by the time it runs.

const uploadProfilePicture = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    if(user){
        user.profilePicture=req.file.path;
        await user.save();

        res.json({
            profilePicture:user.profilePicture
        })
    }
    else{
        res.status(404);
        throw new Error('User not found')
    }
})

// @route GET /api/users/profile 
const getUserProfile = asyncHandler (async (req,res)=>{
    const user= await User.findById(req.user._id).populate('followers following').select('-password');

    if(user){
        res.json(user)
    }
    else{
        res.status(404);
        throw new Error('user is not found')
    }
})

// @route GET /api/users/:id
// Public profile for any user (viewing someone else's profile page).
// Doesn't expose email or password - just what's needed to view a profile,
// see follow counts, and follow/unfollow/message them.
const getUserById = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.params.id)
        .populate('followers following', 'username profilePicture')
        .select('-password -email -twoFactorAuthSecret');

    if(user){
        res.json(user)
    }
    else{
        res.status(404);
        throw new Error('User not found')
    }
})


// @route PUT /api/users/profile 
const updateUserProfile = asyncHandler (async (req,res)=>{
    const user= await User.findById(req.user._id)
    if(user){
        user.username=req.body.username || user.username
        user.email=req.body.email|| user.email
        if(req.body.password){
            user.password=req.body.password;
        }
        const updatedUser = await user.save();

        res.json({
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          followers: updatedUser.followers,
          following: updatedUser.following,
        });

    }
})


// @route GET /api/users/search
const searchUsers=asyncHandler(async (req,res)=>{
    const keyword= req.query.keyword ? {
        username:{
            $regex:req.query.keyword,
            $options:'i'
        }
    } : {}
    const users= await User.find({...keyword}).select('-password');
    res.json(users)
})


// routes POST /api/users/follow/:id

const followUser = asyncHandler (async (req,res)=>{
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if(userToFollow && currentUser){
        if(userToFollow._id.toString()===currentUser._id.toString()){
            res.status(400);
            throw new Error('You cannot follow yourself...')
        }

        else if(!currentUser.following.includes(userToFollow._id)){
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save()
            await userToFollow.save()
            res.json({message:"User Followed"})
        }
        else
        {
            res.json({message:"Already following this user"})
        }
    }
    else {
        res.status(404);
        throw new Error('User not found');
      }
})

// routes POST /api/users/unfollow/:id



const unfollowUser = asyncHandler (async (req,res)=>{
    const userToUnFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if(userToUnFollow && currentUser){
        if(userToUnFollow._id.toString()===currentUser._id.toString()){
            res.status(400);
            throw new Error('You cannot unfollow yourself...')
        }

        else if(currentUser.following.includes(userToUnFollow._id)){
           currentUser.following=currentUser.following.filter(
            (followId)=>followId.toString()!==userToUnFollow._id.toString()
           )
           userToUnFollow.followers=userToUnFollow.following.filter(
            (followId)=>followId.toString()!==userToUnFollow._id.toString()
           );

           await currentUser.save();
           await userToUnFollow.save();
           res.json({message:"User Unfollowed"})
        }
        else
        {
            res.json({message:"Not following this user"})
        }
    }
    else {
        res.status(404);
        throw new Error('User not found');
      }
})

module.exports={upload,uploadProfilePicture,getUserProfile,getUserById,updateUserProfile,searchUsers,followUser,unfollowUser}