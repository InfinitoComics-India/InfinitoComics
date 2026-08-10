import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import dns from 'dns';

// Fix for Node.js v18+ on Windows: SRV DNS queries fail with local resolver
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: './.env' });

const MONGODB_URL = process.env.MONGODB_URL;

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URL);
  console.log('Connected to MongoDB');

  const email = 'admin@infinitohq.com';
  const plainPassword = 'Infinito@1729';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await Admin.findOne({ email });
  if (existing) {
    // Update password in case it changed
    existing.password = hashedPassword;
    await existing.save();
    console.log('✅ Admin password updated for:', email);
    process.exit(0);
  }

  await Admin.create({
    email,
    password: hashedPassword,
    name: 'Super Admin',
    role: 'admin',
  });

  console.log('✅ Admin created successfully!');
  console.log('Email:', email);
  console.log('Password:', plainPassword);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
