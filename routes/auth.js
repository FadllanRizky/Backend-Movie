import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/database.js";

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
    // KUNCI PERBAIKAN: Gunakan select biasa tanpa .single() agar tidak crash jika email belum terdaftar
    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (checkError) throw checkError;

    // Jika array existing ada isinya, berarti email sudah terpakai
    if (existing && existing.length > 0) {
      return res.status(400).json({ msg: "Email sudah digunakan" });
    }

    const hash = await bcrypt.hash(password, 10);

    const { error: insertError } = await supabase
      .from("users")
      .insert([{ fullname, email, password: hash, role: "user" }]);

    if (insertError) throw insertError;

    return res.json({ msg: "Register berhasil" });
  } catch (err) {
    console.error("❌ SUPABASE REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Database error", details: err.message || err });
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
    // Untuk login kita bisa pakai select biasa untuk menghindari crash jika email salah
    const { data: users, error: loginError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (loginError) throw loginError;

    if (!users || users.length === 0) {
      return res.status(400).json({ msg: "Email tidak terdaftar" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ msg: "Password salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "SECRETMBUR",
      { expiresIn: "7d" }
    );

    return res.json({
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
    console.error("❌ SUPABASE LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Database error", details: err.message || err });
  }
});

export default router;