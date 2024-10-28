const mongoose = require('mongoose');
const Thread = require('../models/Thread');

async function updateExistingThreads() {
    try {
        await mongoose.connect('your_mongodb_uri');
        
        // Update all threads to include the new fields
        await Thread.updateMany(
            { readBy: { $exists: false } },
            { 
                $set: { 
                    readBy: [],
                    isSolved: false
                } 
            }
        );

        console.log('Successfully updated threads');
        process.exit(0);
    } catch (error) {
        console.error('Error updating threads:', error);
        process.exit(1);
    }
}

updateExistingThreads();
