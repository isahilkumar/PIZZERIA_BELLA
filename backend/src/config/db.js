const mongoose = require('mongoose');
const { autoSeed } = require('./autoSeed');

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  isConnecting = true;

  let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pizza_delivery';

  // Check if URI is an unconfigured placeholder
  const isPlaceholder = !uri || uri.includes('<cluster-url>') || uri.includes('<username>') || uri.includes('<password>');

  if (isPlaceholder) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('=============================================================================');
      console.warn('⚠️  WARNING: MONGO_URI contains placeholder <cluster-url> or is not set!');
      console.warn('👉 Please open your Render Dashboard -> pizzeria-bella -> Environment tab');
      console.warn('👉 Edit MONGO_URI and paste your real MongoDB Atlas connection string.');
      console.warn('=============================================================================');
      isConnecting = false;
      setTimeout(connectDB, 15000);
      return null;
    } else {
      console.warn('⚠️ MONGO_URI has placeholder <cluster-url>. Falling back to local MongoDB (127.0.0.1:27017)...');
      uri = 'mongodb://127.0.0.1:27017/pizza_delivery';
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;

    // Automatically seed empty cloud databases
    await autoSeed();

    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Cloud MongoDB not reachable yet. Server will stay alive and retry in 10s...');
      console.warn('👉 Verify Network Access in MongoDB Atlas has 0.0.0.0/0 (Allow from Anywhere).');
      setTimeout(connectDB, 10000);
    } else {
      console.warn('⚠️ Local MongoDB not reachable. Retrying in 10s...');
      setTimeout(connectDB, 10000);
    }
    return null;
  }
};

module.exports = connectDB;
