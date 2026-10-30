import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();

function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, city: user.city, area: user.area };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "customer", phone = "", city = "", area = "" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (!["customer", "provider"].includes(role)) {
      return res.status(400).json({ message: "Role must be customer or provider. Admin cannot self-register." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash, role, phone, city, area });
    res.status(201).json({ user: safeUser(user) });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: safeUser(user) });
  } catch (err) { next(err); }
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

export default router;
