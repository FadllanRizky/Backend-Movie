import express from "express";
const router = express.Router();
import { supabase } from "../config/database.js";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";

/* ================= GET REVIEWS FOR A MOVIE ================= */
router.get("/movie/:movieId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("movie_reviews")
      .select("*, users(fullname, email)")
      .eq("movie_id", req.params.movieId);

    if (error) throw error;

    const reviews = data.map((r) => ({
      id: r.id,
      movie_id: r.movie_id,
      user_id: r.user_id,
      comment: r.comment,
      rating: r.rating,
      created_at: r.created_at,
      user: r.users,
    }));

    res.json(reviews);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= ADD REVIEW ================= */
router.post("/", verifyToken, async (req, res) => {
  const { movieId, comment, rating } = req.body;

  if (!movieId || !comment)
    return res.status(400).json({ msg: "movieId dan comment wajib diisi" });

  try {
    const { data, error } = await supabase
      .from("movie_reviews")
      .insert([{
        movie_id: movieId,
        user_id: req.user.id,
        comment,
        rating,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ msg: "Review added", id: data.id });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= UPDATE REVIEW ================= */
router.put("/:id", verifyToken, async (req, res) => {
  const { comment, rating } = req.body;

  try {
    const { data: review, error: findError } = await supabase
      .from("movie_reviews")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (findError || !review)
      return res.status(404).json({ msg: "Review not found" });

    if (review.user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized" });

    const { error } = await supabase
      .from("movie_reviews")
      .update({ comment, rating })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "Review updated" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= DELETE REVIEW ================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { data: review, error: findError } = await supabase
      .from("movie_reviews")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (findError || !review)
      return res.status(404).json({ msg: "Review not found" });

    if (review.user_id !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ msg: "Not authorized" });

    const { error } = await supabase
      .from("movie_reviews")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "Review deleted" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
