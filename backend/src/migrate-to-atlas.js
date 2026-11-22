require('dotenv').config();
const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/pizza_delivery';
const atlasUri = process.env.MONGO_URI;

async function migrateData() {
  if (!atlasUri || atlasUri.includes('127.0.0.1') || atlasUri.includes('localhost') || atlasUri.includes('<cluster-url>')) {
    console.error('❌ Please set a valid MongoDB Atlas connection string in MONGO_URI in .env first.');
    process.exit(1);
  }

  console.log('🔄 Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('✅ Connected to Local MongoDB.');

  console.log('🔄 Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('✅ Connected to MongoDB Atlas.');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`📦 Found ${collections.length} collections locally to migrate.`);

  for (const col of collections) {
    const colName = col.name;
    if (colName.startsWith('system.')) continue;

    console.log(`\n➡️ Migrating collection: "${colName}"...`);
    const localCollection = localConn.db.collection(colName);
    const atlasCollection = atlasConn.db.collection(colName);

    const docs = await localCollection.find({}).toArray();
    console.log(`   Found ${docs.length} documents.`);

    if (docs.length > 0) {
      await atlasCollection.deleteMany({});
      const insertResult = await atlasCollection.insertMany(docs);
      console.log(`   ✅ Successfully transferred ${insertResult.insertedCount} documents to Atlas.`);
    } else {
      console.log(`   (Collection is empty, skipped)`);
    }
  }

  console.log('\n🎉 ALL LOCAL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrateData().catch((err) => {
  console.error('❌ Migration Error:', err.message);
  process.exit(1);
});
