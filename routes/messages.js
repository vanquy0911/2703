const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const messageModel = require("../schemas/messages");
const { checkLogin } = require("../utils/authHandler");
const { uploadFile } = require("../utils/upload");

/**
 * GET /:userID
 * Lấy toàn bộ lịch sử tin nhắn giữa người dùng hiện tại và userID
 */
router.get("/:userID", checkLogin, async (req, res) => {
    try {
        const myId = req.user._id;
        const targetId = req.params.userID;

        const messages = await messageModel.find({
            $or: [
                { from: myId, to: targetId },
                { from: targetId, to: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/**
 * POST /
 * Gửi tin nhắn mới (hỗ trợ text hoặc file)
 */
router.post("/", checkLogin, uploadFile.single("file"), async (req, res) => {
    try {
        const from = req.user._id;
        const { to, text } = req.body;

        let messageContent = {
            type: "text",
            text: text
        };

        // Nếu có file upload
        if (req.file) {
            messageContent.type = "file";
            messageContent.text = req.file.path; // Đường dẫn file
        }

        const newMessage = new messageModel({
            from,
            to,
            messageContent
        });

        await newMessage.save();

        // Gửi qua Socket.io Real-time
        const io = req.app.get("io");
        if (io) {
            io.to(to).emit("new_message", newMessage);
        }

        res.status(201).send(newMessage);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/**
 * GET /
 * Lấy tin nhắn cuối cùng của mỗi cuộc hội thoại
 */
router.get("/", checkLogin, async (req, res) => {
    try {
        const myId = req.user._id;

        const lastMessages = await messageModel.aggregate([
            {
                $match: {
                    $or: [{ from: myId }, { to: myId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$from", myId] },
                            "$to",
                            "$from"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$lastMessage" } },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).send(lastMessages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
