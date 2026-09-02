const express= require("express")
const {protect}= require('../middleware/authMiddleware')
const {
    upload,
    uploadProfilePicture,
    getUserProfile,
    getUserById,
    updateUserProfile,searchUsers
    ,unfollowUser,followUser
} = require('../controllers/userController')
const router = express.Router();

// multer (upload.single) now runs BEFORE `protect`, so the incoming file
// starts being read immediately instead of sitting unread on the socket
// while the auth middleware waits on a database lookup. Matches the same
// fix applied to postRoutes.js.
router.route('/profile/upload').post(upload.single('profilePicture'), protect, uploadProfilePicture)
router.route('/profile').get(protect,getUserProfile).put(protect,updateUserProfile)
router.route('/search').get(protect,searchUsers)
router.route('/follow/:id').post(protect,followUser)
router.route('/unfollow/:id').post(protect,unfollowUser)
// Keep this LAST - it's a catch-all param route ("/:id"), so it must come
// after the more specific literal routes above ("/profile", "/search", etc.)
// or it could shadow them.
router.route('/:id').get(protect,getUserById)

module.exports=router;
