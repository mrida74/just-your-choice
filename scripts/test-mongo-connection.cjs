const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dns = require('dns');

// Workaround: use public DNS servers for Node's c-ares resolver when local DNS refuses
dns.setServers(['8.8.8.8', '1.1.1.1']);

const envPath = path.resolve(__dirname, '..', '.env.local');
let env = '';
try {
  env = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Cannot read .env.local:', e.message);
  process.exit(2);
}

const match = env.match(/^MONGODB_URI=(.*)$/m);
if (!match) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(3);
}

let uri = match[1].trim();
if (uri.startsWith('"') && uri.endsWith('"')) uri = uri.slice(1, -1);

console.log('Attempting MongoDB connection (password redacted)...');
console.log(uri.replace(/:(.*?)@/, ':*****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('MongoDB connected successfully');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('MongoDB connection failed:', err.message || err);
    process.exit(1);
  });
