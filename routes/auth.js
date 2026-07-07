import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase }from "../config/database.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* =========================
   REGISTER (USER)
========================= */
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || fullname.length < 3)
    return res.status(400).json({ msg: "Fullname minimal 3 karakter" });

  if (!email || !emailRegex.test(email))
    return res.status(400).json({ msg: "Email tidak valid" });

  if (!password || password.length < 5)
    return res.status(400).json({ msg: "Password minimal 5 karakter" });

  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing)
      return res.status(400).json({ msg: "Email sudah digunakan" });

    const hash = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([{ fullname, email, password: hash, role: "user" }]);

    if (error) throw error;

    res.json({ msg: "Register berhasil" });
  } catch (err) {
    return res.status(500).json({ msg: "Database error" });
  }
});

/* =========================
   LOGIN (ADMIN & USER)
========================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Email dan password wajib diisi" });

  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user)
      return res.status(400).json({ msg: "Email tidak terdaftar" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "SECRETMBUR",
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login berhasil",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ msg: "Database error" });
  }
});

export default router;
