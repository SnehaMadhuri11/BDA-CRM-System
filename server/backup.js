const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const backupData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    const backup = {};
    for (const collection of collections) {
      const name = collection.name;
      const data = await db.collection(name).find({}).toArray();
      backup[name] = data;
      console.log(`✅ Backed up ${name}: ${data.length} records`);
    }
    
    // Save to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    fs.writeFileSync(`backup-${timestamp}.json`, JSON.stringify(backup, null, 2));
    console.log(`💾 Backup saved to backup-${timestamp}.json`);
    
    process.exit();
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
};

backupData();