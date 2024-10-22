const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/messages/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Error: File upload only supports specific file formats"));
    }
}).single('attachment');

console.log('Setting up messages routes');

// Send a new message
router.post('/', auth, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(400).json({ message: err.message });
        }

        try {
            const { recipient, subject, content } = req.body;
            const recipientUser = await User.findOne({ username: recipient });
            if (!recipientUser) {
                console.log('Recipient user not found:', recipient);
                return res.status(404).json({ message: 'Recipient user not found' });
            }
            console.log('Recipient user found:', recipientUser);

            const newMessage = new Message({
                sender: req.user.id,
                recipient: recipientUser._id,
                subject,
                content,
                attachment: req.file ? {
                    filename: req.file.originalname,
                    path: req.file.path
                } : null,
                read: false // Ensure the message is marked as unread
            });
            const savedMessage = await newMessage.save();
            console.log('Message saved:', savedMessage);
            res.status(201).json(savedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ message: 'Error sending message', error: error.message });
        }
    });
});

// Get all messages for a user (inbox)
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Error fetching inbox', error: error.message });
  }
});

// Get all sent messages for a user
router.get('/sent', auth, async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Error fetching sent messages', error: error.message });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      recipient: req.user.id, 
      read: false
    });
    console.log('Unread message count for user', req.user.id, ':', count);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Error fetching unread message count', error: error.message });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, $or: [{ recipient: req.user.id }, { sender: req.user.id }] },
      { read: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
});

// Get a single message
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username')
      .populate('recipient', 'username');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is either the sender or the recipient
    if (message.sender._id.toString() !== req.user.id && message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view this message' });
    }

    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
});

// Download attachment
router.get('/:id/attachment', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message || !message.attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Check if the user is either the sender or the recipient
    if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to download this attachment' });
    }

    const filePath = path.join(__dirname, '..', message.attachment.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Attachment file not found' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${message.attachment.filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('Error reading file:', error);
      res.status(500).json({ message: 'Error reading attachment file' });
    });
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ message: 'Error downloading attachment', error: error.message });
  }
});

module.exports = router;
