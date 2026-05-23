const { exec } = require('child_process');
const path = require('path');

// Run backup every hour
const scheduleBackup = () => {
  console.log('🔄 Auto-backup scheduler started...');
  
  // Run backup immediately
  runBackup();
  
  // Then run every hour
  setInterval(() => {
    runBackup();
  }, 60 * 60 * 1000); // 1 hour
};

const runBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, 'backups', `auto-backup-${timestamp}.json`);
  
  exec(`mongodump --db bda_crm --out "${path.join(__dirname, 'backups', timestamp)}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error}`);
      return;
    }
    console.log(`✅ Auto-backup completed at ${new Date().toLocaleString()}`);
  });
};

scheduleBackup();