const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    attachment: {
      filename: String,
      path: String
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'deleted'],
      default: 'active'
    },
    parentMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: function() {
        // If no parent message, this message starts its own thread
        return this._id;
      }
    },
    
    quickReplyType: {
      type: String,
      enum: ['none', 'acknowledge', 'approve', 'reject', 'custom'],
      default: 'none'
    },
    
    isQuickReply: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Add static quick reply templates
MessageSchema.statics.quickReplyTemplates = {
  acknowledge: "Message received, thank you.",
  approve: "I approve this request.",
  reject: "I cannot approve this request at this time.",
  custom: "" // For custom quick replies
};

module.exports = mongoose.model('Message', MessageSchema);
