const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
const achievementDefinitions = require('./achievementDefinitions');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('Current directory:', __dirname);
console.log('Environment variables:', process.env);

const MONGO_URL = process.env.MONGODB_URI;

if (!MONGO_URL) {
    console.error('MONGODB_URI is not defined in the environment variables');
    console.log('Available environment variables:', Object.keys(process.env));
    process.exit(1);
}

console.log('Connecting to MongoDB URL:', MONGO_URL);

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

const seedAchievements = async () => {
    try {
        await Achievement.deleteMany({});
        const insertedAchievements = await Achievement.insertMany(
            achievementDefinitions.map(({ name, description, icon, criteria }) => ({
                name,
                description,
                icon,
                criteria: criteria.toString() // Store the criteria function as a string
            }))
        );
        console.log('Achievements seeded successfully:', insertedAchievements);
    } catch (error) {
        console.error('Error seeding achievements:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedAchievements();
