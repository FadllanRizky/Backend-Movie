import express from "express";
const router = express.Router();
import { supabase } from "../config/database.js";

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("genres").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
