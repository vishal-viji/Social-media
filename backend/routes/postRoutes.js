const express = require("express")
const {protect} = require("../middleware/authMiddleware")
const upload = require("../config/multer")

const {
    createPost,
    getPosts,
    createComment,
    getPostById,
    getUserPosts,
    deletePost
} = require('../controllers/postController')

const router = express.Router();


// "api/posts/"

router.route('/').post(protect, upload.single('image'), createPost).get(protect,getPosts);
router.route('/:id').get(protect,getPostById);
router.route('/:id/comments').post(protect,createComment);
router.route('/user/:userId').get(protect,getUserPosts);
router.route('/:id').get(protect,getPostById).delete(protect,deletePost)

module.exports=router