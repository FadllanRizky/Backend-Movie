import express from "express";
const router = express.Router();
import { supabase } from "../config/database.js";
import verifyToken from "../middleware/verifyToken.js";
import isAdmin from "../middleware/isAdmin.js";

/* ================= GET ALL MOVIES ================= */
router.get("/", async (req, res) => {
  try {
    const { data: movies, error } = await supabase
      .from("movies")
      .select("*, movie_genres(genre_id, genres(name))")
      .order("release_year", { ascending: false });

    if (error) throw error;

    const data = movies.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      rating: m.rating,
      release_year: m.release_year,
      duration: m.duration,
      poster_url: m.poster_url,
      trailer_url: m.trailer_url,
      director: m.director,
      genres: m.movie_genres
        ? m.movie_genres.map((mg) => mg.genres?.name).filter(Boolean)
        : [],
    }));

    res.json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= ADD MOVIE ================= */
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const {
    title,
    description,
    rating,
    release_year,
    duration,
    poster_url,
    trailer_url,
    director,
    genreIds,
  } = req.body;

  try {
    const { data: movie, error } = await supabase
      .from("movies")
      .insert([{
        title,
        description,
        rating,
        release_year,
        duration,
        poster_url,
        trailer_url,
        director,
      }])
      .select()
      .single();

    if (error) throw error;

    if (genreIds && genreIds.length > 0) {
      const genreRelations = genreIds.map((genreId) => ({
        movie_id: movie.id,
        genre_id: genreId,
      }));

      const { error: genreError } = await supabase
        .from("movie_genres")
        .insert(genreRelations);

      if (genreError) throw genreError;
    }

    res.json({ msg: "Movie added", id: movie.id });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= UPDATE MOVIE ================= */
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    rating,
    release_year,
    duration,
    poster_url,
    trailer_url,
    director,
    genreIds,
  } = req.body;

  try {
    const { error } = await supabase
      .from("movies")
      .update({
        title,
        description,
        rating,
        release_year,
        duration,
        poster_url,
        trailer_url,
        director,
      })
      .eq("id", id);

    if (error) throw error;

    if (genreIds !== undefined) {
      await supabase.from("movie_genres").delete().eq("movie_id", id);

      if (genreIds.length > 0) {
        const genreRelations = genreIds.map((genreId) => ({
          movie_id: id,
          genre_id: genreId,
        }));

        const { error: genreError } = await supabase
          .from("movie_genres")
          .insert(genreRelations);

        if (genreError) throw genreError;
      }
    }

    res.json({ msg: "Movie updated" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/* ================= DELETE MOVIE ================= */
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("movies")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ msg: "Movie deleted" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default router;
