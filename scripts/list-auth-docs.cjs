const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
let env = '';
try { env = fs.readFileSync(envPath, 'utf8'); } catch (e) { console.error('Cannot read .env.local:', e.message); process.exit(2); }
const match = env.match(/^MONGODB_URI=(.*)$/m);
if (!match) { console.error('MONGODB_URI not found'); process.exit(3); }
let uri = match[1].trim(); if (uri.startsWith('"') && uri.endsWith('"')) uri = uri.slice(1, -1);

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = (new URL(uri.includes('?') ? uri.split('/').pop().split('?')[0] : uri.split('/').pop())).pathname || 'just-your-choice';
  } catch (e) {
    // ignore, compute DB name simpler
  }
  const db = client.db(process.env.MONGODB_DB || 'just-your-choice');
  console.log('DB:', db.databaseName);
  const colls = await db.listCollections().toArray();
  console.log('Collections:', colls.map(c => c.name).join(', '));

  const users = await db.collection('users').find().limit(5).toArray();
  console.log('\nUsers (up to 5):', users);
  const accounts = await db.collection('accounts').find().limit(10).toArray();
  console.log('\nAccounts (up to 10):', accounts);

  await client.close();
})().catch(err => { console.error(err); process.exit(1); });
