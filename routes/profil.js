import express from "express";
const router = express.Router();
import {supabase} from "../config/database.js";
import verifyToken from "../middleware/verifyToken.js";

/* ================= GET PROFILE ================= */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, fullname, email, role, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user)
      return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
