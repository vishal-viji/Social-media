const express = require('express');
const {protect}= require('../middleware/authMiddleware');
const {accessChat,sendMessage,getUserChats,getChatMessages} = require('../controllers/chatController')

const router = express.Router();

router.route('/').post(protect,accessChat).get(protect,getUserChats);
router.route('/:chatId').get(protect,getChatMessages)
router.route('/:chatId/message').post(protect,sendMessage);

module.exports=router