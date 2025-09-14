const asyncHandler= require('express-async-handler');
const multer = require('multer')
const path = require('path')
const User = require('../models/User')


// set up multer for file uploads

const storage= multer.diskStorage({
 destination(req,file,cb){
    cb(null,'uploads/')
 },
 filename(req,file,cb){
    cb(null, `${file.filename}-${Date.now()}${path.extname(file.originalname)}`)
 }
})


const upload = multer({
    storage,
    fileFilter(req,file,cb){
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ||file.mimetype === 'image/jpg') {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type. Only JPEG,JPG and PNG are allowed.'));
          }
    }
})


// @routes POST /api/users/profile/upload

const uploadProfilePicture=[
    upload.single('profilePicture'),
    asyncHandler(async(req,res)=>{
        const user = await User.findById(req.user._id);

        if(user){
            user.profilePicture=`/uploads/${req.file.filename}`;
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
]

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








module.exports={uploadProfilePicture,getUserProfile,updateUserProfile,searchUsers,followUser,unfollowUser}