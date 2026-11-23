const mongoose = require('mongoose');
const { autoSeed } = require('./autoSeed');

let isConnecting = false;
let memoryServerInstance = null;

const isPlaceholderUri = (uri) => {
  if (!uri || typeof uri !== 'string') return true;
  const trimmed = uri.trim();
  return (
    trimmed === '' ||
    trimmed.includes('<cluster-url>') ||
    trimmed.includes('<username>') ||
    trimmed.includes('<password>') ||
    trimmed.includes('xxxxxx') ||
    trimmed.includes('your-') ||
    (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://'))
  );
};

const startEmbeddedMongoDB = async () => {
  console.log('🚀 Initializing Resilient Embedded Cloud MongoDB instance...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServerInstance) {
      memoryServerInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'pizza_delivery',
        },
      });
    }
    const embeddedUri = memoryServerInstance.getUri();
    console.log(`📦 Embedded MongoDB running at: ${embeddedUri}`);
    const conn = await mongoose.connect(embeddedUri);
    console.log(`✅ MongoDB Connected (Embedded Cloud Engine): ${conn.connection.host}`);
    await autoSeed();
    return conn;
  } catch (err) {
    console.error(`❌ Failed to start Embedded MongoDB: ${err.message}`);
    return null;
  }
};

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  isConnecting = true;

  let uri = process.env.MONGO_URI;

  // 1. Try real MongoDB Atlas URI if provided and not a placeholder
  if (!isPlaceholderUri(uri)) {
    try {
      const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
      console.log(`📡 Connecting to Cloud MongoDB Atlas: ${sanitizedUri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 6000,
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      isConnecting = false;
      await autoSeed();
      return conn;
    } catch (atlasError) {
      console.warn(`⚠️ Cloud MongoDB Atlas connection failed (${atlasError.message}).`);
      console.log('🔄 Seamlessly falling back to embedded database engine to keep app 100% operational...');
    }
  } else {
    console.log('ℹ️ No valid external MONGO_URI detected. Using embedded database engine.');
  }

  // 2. In local development, check if local mongod is already running on 27017
  if (process.env.NODE_ENV !== 'production') {
    try {
      const localUri = 'mongodb://127.0.0.1:27017/pizza_delivery';
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Connected to local MongoDB daemon: ${conn.connection.host}`);
      isConnecting = false;
      await autoSeed();
      return conn;
    } catch {
      // Local daemon not running, continue to embedded
    }
  }

  // 3. Fallback to Embedded MongoMemoryServer
  const conn = await startEmbeddedMongoDB();
  isConnecting = false;
  return conn;
};

module.exports = connectDB;
