const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create or get a chat between users
// @route   POST /api/chat
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  }).populate('users', '-password').populate('messages.sender', '-password');

  if (!chat) {
    chat = new Chat({
      users: [req.user._id, userId],
    });
    await chat.save();
  }

  res.json(chat);
});

// @desc    Send a message
// @route   POST /api/chat/:chatId/message
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const chat = await Chat.findById(chatId);

  if (chat) {
    const message = {
      sender: req.user._id,
      content,
      timestamp: Date.now(),
    };

    chat.messages.push(message);
    await chat.save();
    res.json(chat);
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
});

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ users: req.user._id }).populate('users', '-password').populate('messages.sender', '-password');
  res.json(chats);
});

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId
// @access  Private
const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId).populate('users', '-password').populate('messages.sender', '-password');

  if (chat) {
    res.json(chat.messages);
  } else {
    res.status(404);
    throw new Error('Chat not found');
  }
});

module.exports = { accessChat, sendMessage, getUserChats, getChatMessages };
