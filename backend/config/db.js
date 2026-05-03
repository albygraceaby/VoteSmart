const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/votesmart');
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
      }
    }
  }
  console.error('❌ All MongoDB connection attempts failed. Server will continue without DB.');
};

module.exports = connectDB;
