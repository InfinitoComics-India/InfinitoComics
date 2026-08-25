import mongoose from "mongoose";
import bcrypt from "bcrypt";

const VALID_ROLES = ["superadmin", "comics_admin", "character_admin", "research_admin", "blog_admin", "career_admin"];

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => v.endsWith("@infinitohq.com"),
      message: "Email must be an @infinitohq.com address"
    }
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: VALID_ROLES,
      message: `Role must be one of: ${VALID_ROLES.join(", ")}`
    }
  }
}, { timestamps: true });

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;