import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO = 'mongodb+srv://tech_db_user:Infinito%401729@cluster0.bamlmyg.mongodb.net/infinito-comics?retryWrites=true&w=majority&appName=Cluster0';
await mongoose.connect(MONGO);

const col = mongoose.connection.collection('admins');
const all = await col.find({}).toArray();

console.log('\n=== ALL ADMINS ===');
all.forEach(a => console.log(`${a.employeeId || '—'} | ${a.name} | ${a.email} | roles: ${JSON.stringify(a.roles)}`));

await mongoose.disconnect();
