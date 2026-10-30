import { Router } from "express";
import Service from "../models/Service.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q = "", category = "", area = "", maxPrice } = req.query;
    const filter = { approvalStatus: "approved", isActive: true };
    if (category) filter.category = category;
    if (area) filter.serviceAreas = { $regex: String(area).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (maxPrice !== undefined && Number.isFinite(Number(maxPrice))) filter.price = { $lte: Number(maxPrice) };
    if (q) {
      const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: { $regex: safe, $options: "i" } }, { description: { $regex: safe, $options: "i" } }];
    }
    const services = await Service.find(filter)
      .populate("providerId", "name city area verificationStatus")
      .sort({ createdAt: -1 }).limit(100);
    res.json({ services });
  } catch (err) { next(err); }
});

router.get("/mine", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const services = await Service.find({ providerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ services });
  } catch (err) { next(err); }
});

router.post("/", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const { title, category, description, price, experienceYears = 0, serviceAreas = [] } = req.body;
    if (!title?.trim() || !category || !description?.trim() || price === undefined) {
      return res.status(400).json({ message: "Title, category, description and price are required." });
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) return res.status(400).json({ message: "Price must be a valid non-negative number." });
    const service = await Service.create({
      providerId: req.user._id, title: title.trim(), category, description: description.trim(),
      price: numericPrice, experienceYears: Number(experienceYears) || 0,
      serviceAreas: Array.isArray(serviceAreas) ? serviceAreas.map(String).map(s => s.trim()).filter(Boolean) : [],
      approvalStatus: "pending"
    });
    res.status(201).json({ message: "Listing submitted for admin approval.", service });
  } catch (err) { next(err); }
});

router.patch("/:id", protect, allowRoles("provider"), async (req, res, next) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, providerId: req.user._id });
    if (!service) return res.status(404).json({ message: "Listing not found." });
    const allowed = ["title", "category", "description", "price", "experienceYears", "serviceAreas", "isActive"];
    for (const key of allowed) if (req.body[key] !== undefined) service[key] = req.body[key];
    // Any edit returns the listing to pending review.
    service.approvalStatus = "pending";
    await service.save();
    res.json({ message: "Listing updated and sent for approval.", service });
  } catch (err) { next(err); }
});

export default router;
