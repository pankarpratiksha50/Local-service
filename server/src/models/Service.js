import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, enum: ["Plumber", "Electrician", "Carpenter", "Painter", "Cleaner", "AC Repair", "Appliance Repair", "Other"] },
  description: { type: String, required: true, maxlength: 1500 },
  price: { type: Number, required: true, min: 0 },
  experienceYears: { type: Number, default: 0, min: 0, max: 70 },
  serviceAreas: [{ type: String, trim: true }],
  images: [{ type: String }],
  approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

serviceSchema.index({ category: 1, approvalStatus: 1, isActive: 1 });
serviceSchema.index({ "serviceAreas": 1 });

export default mongoose.model("Service", serviceSchema);
