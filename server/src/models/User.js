import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
  phone: { type: String, default: "" },
  city: { type: String, default: "" },
  area: { type: String, default: "" },
  verificationStatus: { type: String, enum: ["unverified", "pending", "verified", "rejected"], default: "unverified" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
