const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[SUCCESS] Connected to MongoDB`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('[ERROR] MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('[WARNING] MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('[INFO] MongoDB reconnected');
    });
    
  } catch (err) {
    console.error('[ERROR] MongoDB connection error:', err);
    process.exit(1); // Exit if can't connect to DB
  }
};

module.exports = connectDB;