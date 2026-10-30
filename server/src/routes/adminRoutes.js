import { Router } from "express";
import Service from "../models/Service.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = Router();

router.patch("/services/:id/approval", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return res.status(400).json({ message: "approvalStatus must be approved, rejected or pending." });
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id, { approvalStatus }, { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: "Listing not found." });
    res.json({ service });
  } catch (err) { next(err); }
});

router.get("/services/pending", protect, allowRoles("admin"), async (_req, res, next) => {
  try {
    const services = await Service.find({ approvalStatus: "pending" })
      .populate("providerId", "name email").sort({ createdAt: 1 });
    res.json({ services });
  } catch (err) { next(err); }
});

export default router;
