import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGODB_URL = 'mongodb+srv://rupamrinki415_db_user:w5RngViUU1GcynOW@cluster0.o0yjend.mongodb.net/infinito-comics?retryWrites=true&w=majority&appName=Cluster0';

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  dob: Date,
  username: String,
  newsLetter: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
});

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
  await mongoose.connect(MONGODB_URL);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'test@infinitohq.com' });
  if (existing) {
    console.log('Test user already exists:', existing.email);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('Test@1234', 10);
  const user = await User.create({
    email: 'test@infinitohq.com',
    password: hashedPassword,
    name: 'Test User',
    dob: new Date('2000-01-01'),
    username: 'testuser01',
    newsLetter: true,
    isVerified: true,
  });

  console.log('✅ Test user created successfully!');
  console.log('Email:    test@infinitohq.com');
  console.log('Password: Test@1234');
  console.log('User ID:', user._id);

  await mongoose.disconnect();
}

createTestUser().catch(console.error);
