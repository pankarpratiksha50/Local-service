import { Router } from "express";
const router = Router();

router.post("/analyze-review", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  if (!text || text.length > 2000) {
    return res.status(400).json({ message: "Review text is required and must be under 2000 characters." });
  }
  const base = process.env.ML_SERVICE_URL || "http://localhost:8000";
  try {
    const response = await fetch(`${base}/analyze-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch {
    res.status(503).json({ message: "ML service is unavailable. Start the Python service and try again." });
  }
});

export default router;
