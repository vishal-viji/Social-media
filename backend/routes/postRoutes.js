const express = require("express")
const {protect} = require("../middleware/authMiddleware")

const {
    upload,
    createPost,
    getPosts,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
} = require('../controllers/postController')

const router = express.Router();


// "api/posts/"

// multer (upload.single) now runs BEFORE `protect`, so the incoming file
// starts being read immediately instead of sitting unread on the socket
// while the auth middleware waits on a database lookup. This fixed an
// intermittent "Unexpected end of form" error on Render, where the
// connection could get cut short during that delay.
router.route('/').post(upload.single('image'), protect, createPost).get(protect,getPosts);
router.route('/:id').get(protect,getPostById);
router.route('/:id/comments').post(protect,createComment);
router.route('/user/:userId').get(protect,getUserPosts);
router.route('/:id').get(protect,getPostById).delete(protect,deletePost)

module.exports=router