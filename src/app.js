import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "../routes/auth.js";
import movieRoutes from "../routes/movie.js";
import adminRoutes from "../routes/admin.js";
import genreRoutes from "../routes/genre.js";
import profileRoutes from "../routes/profil.js";
import movieActorRoutes from "../routes/movieActor.js";
import movieReviewRoutes from "../routes/movieReview.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Daftar Rute API kamu
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profil", profileRoutes);
app.use("/api/movie-actors", movieActorRoutes);
app.use("/api/movie-reviews", movieReviewRoutes);
app.use("/api/genres", genreRoutes); // Ditambahkan '/api' di depannya agar seragam

// Health check rute utama
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Backend Movie Mbur API!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Hanya jalankan server lokal jika bukan di Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

// Eksport default app untuk serverless Vercel
export default app;