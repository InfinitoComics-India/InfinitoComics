import mongoose from 'mongoose';

const OLD_DB = 'mongodb+srv://rupamrinki415_db_user:w5RngViUU1GcynOW@cluster0.o0yjend.mongodb.net/infinito-comics?retryWrites=true&w=majority&appName=Cluster0';
const NEW_DB = 'mongodb+srv://tech_db_user:Infinito@1729@cluster0.bamlmyg.mongodb.net/infinito-comics?retryWrites=true&w=majority&appName=Cluster0';

const COLLECTIONS = [
  'users', 'admins', 'comics', 'characters', 'blogs',
  'careers', 'faqs', 'feedbacks', 'timelines', 'researchpapers',
  'payments', 'errorreports', 'researchapplications',
  'supportus', 'jobapplications'
];

async function migrate() {
  console.log('Connecting to OLD database...');
  const oldConn = await mongoose.createConnection(OLD_DB).asPromise();
  console.log('✅ Connected to OLD DB');

  console.log('Connecting to NEW database...');
  const newConn = await mongoose.createConnection(NEW_DB).asPromise();
  console.log('✅ Connected to NEW DB');

  let totalMigrated = 0;

  for (const collName of COLLECTIONS) {
    try {
      const oldCol = oldConn.collection(collName);
      const newCol = newConn.collection(collName);

      const docs = await oldCol.find({}).toArray();
      if (docs.length === 0) {
        console.log(`⚪ ${collName}: empty, skipping`);
        continue;
      }

      // Delete existing docs in new collection to avoid duplicates
      await newCol.deleteMany({});

      // Insert all docs from old to new
      await newCol.insertMany(docs, { ordered: false });
      console.log(`✅ ${collName}: migrated ${docs.length} documents`);
      totalMigrated += docs.length;
    } catch (err) {
      console.error(`❌ ${collName}: failed — ${err.message}`);
    }
  }

  console.log(`\n🎉 Migration complete! Total documents migrated: ${totalMigrated}`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
