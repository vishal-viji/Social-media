const asyncHandler= require('express-async-handler');
const multer = require('multer')
const path = require('path')
const Post = require('../models/Post')


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

// Create a new post
// POST /api/posts

const createPost =[
    upload.single('image'),
    asyncHandler(async (req,res)=>{
        const {content}=req.body;
        const image= req.file ? `/uploads/${req.file.filename}` : null;

        const post = new Post({
            user:req.user._id,
            content,
            image,
        })

        const createdPost = await post.save();
        res.status(201).json(createdPost)
    })
];

//Get posts from followings users or own posts
// GET /api/posts

const getPosts = asyncHandler(async (req,res)=>{
    const user=req.user;
    const following=user.following;
    const posts = await Post.find({
        $or:[
            {user:{$in:following}},
            {user:user._id}
        ]
    })
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
    createPost,
    getPosts,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
}