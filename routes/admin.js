import express from "express";
const router = express.Router();
import {supabase} from "../config/database.js";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";

/* ================= GET USERS ================= */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, fullname, email, role");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    return res.status(500).json({ msg: "Database error" });
  }
});

/* ================= UPDATE USER ================= */
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const { fullname, email, role } = req.body;

  try {
    const { error } = await supabase
      .from("users")
      .update({ fullname, email, role })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "User updated" });
  } catch (err) {
    return res.status(500).json({ msg: "Update failed" });
  }
});

/* ================= DELETE USER ================= */
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "User deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "Delete failed" });
  }
});

export default router;
