// seed.js
// Adds sample users and posts to your database for testing.
//
// Run with:  node seed.js
// Undo with: node seed.js --destroy   (deletes only the sample data this script created)

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const sampleUsers = [
  { username: 'alice_wonder', email: 'alice@example.com', password: 'password@123' },
  { username: 'bob_builder', email: 'bob@example.com', password: 'password@123' },
  { username: 'charlie_dev', email: 'charlie@example.com', password: 'password@123' },
  { username: 'dana_designs', email: 'dana@example.com', password: 'password@123' },
  { username: 'eli_explores', email: 'eli@example.com', password: 'password123' },
];

const samplePostContent = [
  'Just deployed my first full-stack app!',
  'Coffee first, code second ☕',
  'Debugging is like being a detective in a crime movie where you are also the murderer.',
  'Anyone else obsessed with clean commit messages?',
  'Weekend project turned into a full week project 😅',
  'Learning something new every day.',
  'Finally fixed that bug that took 3 days to find.',
  'Sharing some progress on my side project!',
  'Good vibes only today.',
  'Refactoring old code and questioning all my life choices.',
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialmedia');
    console.log('Connected to database.');

    const createdUsers = [];

    for (const userData of sampleUsers) {
      // Skip if a user with this email already exists, so re-running is safe.
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists, skipping.`);
        createdUsers.push(existing);
        continue;
      }
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create 1-3 sample posts per user, with randomly picked content.
    let postCount = 0;
    for (const user of createdUsers) {
      const numPosts = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPosts; i++) {
        const content = samplePostContent[Math.floor(Math.random() * samplePostContent.length)];
        await Post.create({
          user: user._id,
          content,
        });
        postCount++;
      }
    }

    console.log(`Done. Created/verified ${createdUsers.length} users and added ${postCount} sample posts.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialmedia');
    console.log('Connected to database.');

    const emails = sampleUsers.map((u) => u.email);
    const usersToRemove = await User.find({ email: { $in: emails } });
    const userIds = usersToRemove.map((u) => u._id);

    const deletedPosts = await Post.deleteMany({ user: { $in: userIds } });
    const deletedUsers = await User.deleteMany({ email: { $in: emails } });

    console.log(`Removed ${deletedUsers.deletedCount} sample users and ${deletedPosts.deletedCount} of their posts.`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

if (process.argv.includes('--destroy')) {
  destroyData();
} else {
  seedDatabase();
}