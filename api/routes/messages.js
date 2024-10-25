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

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error("Error: File upload only supports specific file formats"));
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

console.log('Setting up messages routes');

// Send a new message
router.post('/', auth, upload.single('attachment'), async (req, res) => {
    try {
        const { recipient, subject, content } = req.body;
        const sender = req.user.id;

        // Find the recipient user by username
        const recipientUser = await User.findOne({ username: recipient });
        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        const newMessage = new Message({
            sender,
            recipient: recipientUser._id,
            subject,
            content,
            status: 'active' // Ensure the message is set as active
        });

        if (req.file) {
            newMessage.attachment = {
                filename: req.file.originalname,
                path: req.file.path,
            };
        }

        await newMessage.save();

        // Increment unread count for the recipient
        await User.findByIdAndUpdate(recipientUser._id, { $inc: { unreadMessageCount: 1 } });

        // Send notification (you can implement this based on your notification system)
        // await sendNotification(recipientUser._id, 'New message received');

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});

// Implement the sendNotification function if it doesn't exist
async function sendNotification(userId, message) {
    try {
        // You can add more notification logic here if needed
        console.log(`Sending notification to user ${userId}: ${message}`);
        // This is where you would typically integrate with a real-time notification system
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Get all messages for a user (inbox)
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user.id,
      $or: [
        { status: 'active' },
        { status: { $exists: false } }  // Include messages without status field
      ]
    })
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
    const messages = await Message.find({
      sender: req.user.id,
      $or: [
        { status: 'active' },
        { status: { $exists: false } }  // Include messages without status field
      ]
    })
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
    const user = await User.findById(req.user.id);
    res.json({ count: user.unreadMessageCount || 0 });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Error fetching unread message count', error: error.message });
  }
});

// Get draft messages - MOVED BEFORE /:id route
router.get('/drafts', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ recipient: req.user.id }, { sender: req.user.id }],
      status: 'draft'
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching draft messages:', error);
    res.status(500).json({ message: 'Error fetching draft messages', error: error.message });
  }
});

// Move to draft
router.put('/:id/draft', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, $or: [{ recipient: req.user.id }, { sender: req.user.id }] },
      { status: 'draft' },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error moving message to draft:', error);
    res.status(500).json({ message: 'Error moving message to draft', error: error.message });
  }
});

// Restore from draft
router.put('/:id/restore', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, $or: [{ recipient: req.user.id }, { sender: req.user.id }], status: 'draft' },
      { status: 'active' },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found, unauthorized, or not in draft' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error restoring message from draft:', error);
    res.status(500).json({ message: 'Error restoring message from draft', error: error.message });
  }
});

// Permanently delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      $or: [{ recipient: req.user.id }, { sender: req.user.id }],
      status: 'draft'
    });
    if (!message) {
      return res.status(404).json({ message: 'Message not found, unauthorized, or not in draft' });
    }
    res.json({ message: 'Message permanently deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
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

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id, read: false },
      { read: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found or already read' });
    }
    // Decrement the unread count for the user
    await User.findByIdAndUpdate(req.user.id, { $inc: { unreadMessageCount: -1 } });
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
});

// Add new reply endpoint
router.post('/:messageId/reply', auth, upload.single('attachment'), async (req, res) => {
  try {
    const parentMessage = await Message.findById(req.params.messageId);
    if (!parentMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    const newReply = new Message({
      sender: req.user.id,
      recipient: parentMessage.sender, // Reply goes to original sender
      subject: `Re: ${parentMessage.subject}`,
      content: req.body.content,
      parentMessageId: parentMessage._id,
      threadId: parentMessage.threadId || parentMessage._id
    });

    if (req.file) {
      newReply.attachment = {
        filename: req.file.originalname,
        path: req.file.path,
      };
    }

    await newReply.save();
    
    // Increment unread count for recipient
    await User.findByIdAndUpdate(parentMessage.sender, { 
      $inc: { unreadMessageCount: 1 } 
    });

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Error sending reply', error: error.message });
  }
});

// Add thread retrieval endpoint
router.get('/:threadId/thread', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      threadId: req.params.threadId,
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username profilePicture')
    .populate('recipient', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Error fetching thread', error: error.message });
  }
});

// Add quick reply endpoint
router.post('/:messageId/quick-reply', auth, async (req, res) => {
  try {
    const { type, customMessage } = req.body;
    const parentMessage = await Message.findById(req.params.messageId);
    
    if (!parentMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    let content = '';
    if (type === 'custom') {
      content = customMessage;
    } else {
      content = Message.quickReplyTemplates[type] || '';
    }

    const newReply = new Message({
      sender: req.user.id,
      recipient: parentMessage.sender,
      subject: `Re: ${parentMessage.subject}`,
      content,
      parentMessageId: parentMessage._id,
      threadId: parentMessage.threadId || parentMessage._id,
      isQuickReply: true,
      quickReplyType: type
    });

    await newReply.save();
    
    // Increment unread count for recipient
    await User.findByIdAndUpdate(parentMessage.sender, { 
      $inc: { unreadMessageCount: 1 } 
    });

    res.status(201).json(newReply);
  } catch (error) {
    console.error('Error sending quick reply:', error);
    res.status(500).json({ message: 'Error sending quick reply', error: error.message });
  }
});

module.exports = router;
