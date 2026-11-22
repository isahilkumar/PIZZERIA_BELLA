const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizza_delivery';
    if (uri.includes('<cluster-url>')) {
      console.warn('⚠️ MONGO_URI has placeholder <cluster-url>. Falling back to local MongoDB (127.0.0.1:27017)...');
      uri = 'mongodb://127.0.0.1:27017/pizza_delivery';
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Ensure MongoDB is running on port 27017 (or configured in .env MONGO_URI)');
    process.exit(1);
  }
};

module.exports = connectDB;

