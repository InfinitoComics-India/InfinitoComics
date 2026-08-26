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
  // roles is now an array (max 4), but we keep role as fallback for backward compat
  roles: {
    type: [String],
    enum: {
      values: VALID_ROLES,
      message: `Each role must be one of: ${VALID_ROLES.join(", ")}`
    },
    validate: {
      validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 4,
      message: "An admin must have between 1 and 4 roles"
    },
    default: undefined
  },
  // Keep old role field for backward compatibility
  role: {
    type: String,
    enum: {
      values: VALID_ROLES,
      message: `Role must be one of: ${VALID_ROLES.join(", ")}`
    }
  }
}, { timestamps: true });

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
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