var express = require('express');
var router = express.Router();
let messageController = require('../controllers/messages');
let { checkLogin } = require('../utils/authHandler.js');

// GET /:userID - Get all messages between current user and specified userID
router.get('/:userID', checkLogin, async function (req, res, next) {
    try {
        let currentUserId = req.userId;
        let otherUserId = req.params.userID;

        let messages = await messageController.GetConversation(currentUserId, otherUserId);
        res.send(messages);
    } catch (error) {
        res.status(500).send({
            message: "Lỗi khi lấy tin nhắn",
            error: error.message
        });
    }
});

// POST / - Create a new message
router.post('/', checkLogin, async function (req, res, next) {
    try {
        let currentUserId = req.userId;
        let toUserId = req.body.to;
        let messageContent = req.body.messageContent;

        if (!toUserId || !messageContent || !messageContent.type || !messageContent.text) {
            res.status(400).send({
                message: "Dữ liệu không hợp lệ. Cần cung cấp: to, messageContent { type, text }"
            });
            return;
        }

        if (!['file', 'text'].includes(messageContent.type)) {
            res.status(400).send({
                message: "Type phải là 'file' hoặc 'text'"
            });
            return;
        }

        let newMessage = await messageController.CreateMessage(
            currentUserId,
            toUserId,
            messageContent
        );

        res.status(201).send({
            message: "Gửi tin nhắn thành công",
            data: newMessage
        });
    } catch (error) {
        res.status(500).send({
            message: "Lỗi khi gửi tin nhắn",
            error: error.message
        });
    }
});

// GET / - Get last message from each user
router.get('/', checkLogin, async function (req, res, next) {
    try {
        let currentUserId = req.userId;
        let messages = await messageController.GetLastMessageFromEachUser(currentUserId);
        res.send(messages);
    } catch (error) {
        res.status(500).send({
            message: "Lỗi khi lấy danh sách tin nhắn gần đây",
            error: error.message
        });
    }
});

module.exports = router;
