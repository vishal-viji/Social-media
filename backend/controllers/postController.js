const asyncHandler= require('express-async-handler');
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const Post = require('../models/Post')


// Multer buffers the file fully in memory. Exported separately so the route
// file can run this BEFORE the auth check, letting the incoming file stream
// start being consumed immediately instead of sitting unread while the auth
// middleware waits on a database call.
const storage = multer.memoryStorage();

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

// helper: upload a buffer to Cloudinary using a stream, wrapped in a Promise
const uploadBufferToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'social-media-posts' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

// Create a new post
// POST /api/posts
// NOTE: multer (upload.single) now runs in postRoutes.js BEFORE the `protect`
// auth middleware, so this handler can assume req.file and req.user are both
// already available by the time it runs.

const createPost = asyncHandler(async (req,res)=>{
    const {content}=req.body;
    let image = null;

    if (req.file) {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        image = result.secure_url;
    }

    const post = new Post({
        user:req.user._id,
        content,
        image,
    })

    const createdPost = await post.save();
    res.status(201).json(createdPost)
});

// Get all posts, from every user - not just people you follow.
// Newest posts first.
// GET /api/posts

const getPosts = asyncHandler(async (req,res)=>{
    const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .populate('user','username profilePicture')
    .populate('comments.user','username profilePicture')

    res.json(posts)
})


// create a new comment
// POST /api/posts/:id/comments
const createComment = asyncHandler(async (req, res)=>{
    const {content} = req.body;
    const post = await Post.findById(req.params.id);
    if(post){
        const comment={
            user:req.user._id,
            content,

        };
        post.comments.push(comment);
        await post.save();

        res.status(201).json({message:'Comment Added'})
    }
    else{
        res.status(401);
        throw new Error('Post not found')
    }
})

// getPOstbyid
// /api/posts/:id

const getPostById = asyncHandler(async (req,res)=>{
    const post = await Post.findById(req.params.id)
    .populate('user','username profilePicture')
    .populate('comments.user','username profilePicture')

    if(post){
        res.json(post)
    }
    else{
        res.status(404);
        throw new Error('Post not found')
    }
});

//get users posts

const getUserPosts = asyncHandler(async(req,res)=>{
    const posts = await Post.find({user:req.params.userId}).populate('user','username profilePicture').populate('comments.user','username');
    res.json(posts)
})


// deletePost
const deletePost=asyncHandler(async (req,res)=>{
    const post=await Post.findById(req.params.id);
    if(post){
        if(post.user.toString()!==req.user._id.toString()){
            res.status(401);
            throw new Error('You are not authorized to delete this post');
        }
        await Post.deleteOne({_id:req.params.id});
        res.json({message:'Post removed'})
    }
    else{
        res.status(404);
        throw new Error('Post not found')
    }
})

module.exports={
    upload,
    createPost,
    getPosts,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
}