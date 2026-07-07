import express from "express";
const router = express.Router();
import { supabase } from "../config/database.js";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";

/* ================= GET ALL ACTORS FOR A MOVIE ================= */
router.get("/movie/:movieId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("movie_actors")
      .select("*")
      .eq("movie_id", req.params.movieId);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= ADD ACTOR ================= */
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { movieId, actorName, role } = req.body;

  if (!movieId || !actorName)
    return res.status(400).json({ msg: "movieId dan actorName wajib diisi" });

  try {
    const { data, error } = await supabase
      .from("movie_actors")
      .insert([{ movie_id: movieId, actor_name: actorName, role }])
      .select()
      .single();

    if (error) throw error;
    res.json({ msg: "Actor added", id: data.id });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= UPDATE ACTOR ================= */
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { movieId, actorName, role } = req.body;

  try {
    const { error } = await supabase
      .from("movie_actors")
      .update({ movie_id: movieId, actor_name: actorName, role })
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "Actor updated" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= DELETE ACTOR ================= */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from("movie_actors")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ msg: "Actor deleted" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
