const express= require("express")
const {protect}= require('../middleware/authMiddleware')
const {uploadProfilePicture,
    getUserProfile,updateUserProfile,searchUsers
    ,unfollowUser,followUser
} = require('../controllers/userController')
const router = express.Router();

router.route('/profile/upload').post(protect,uploadProfilePicture)
router.route('/profile').get(protect,getUserProfile).put(protect,updateUserProfile)
router.route('/search').get(protect,searchUsers)
router.route('/follow/:id').post(protect,followUser)
router.route('/unfollow/:id').post(protect,unfollowUser)

module.exports=router;