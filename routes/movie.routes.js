import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Movie from "../models/movie.model.js";

const router = express.Router();

//POST - ADD NEW MOVIE - SHOULD BE PROTECTED BY ISAUTH AND ISADMIN
//CHECKED AND WORKING
router.post("/", isAuth, isAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      releaseYear,
      genre,
      cast,
      posterImg,
      backdropImg,
      rating,
      trailerUrl,
      popularity,
    } = req.body;
    const movieData = {
      title,
      description,
      releaseYear,
      genre,
      cast,
      posterImg,
      backdropImg,
      rating,
      trailerUrl,
      popularity,
    };
    for (const property in movieData) {
      if (!movieData[property]) {
        delete movieData.property;
      }
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({ message: "Movie added successfully", movie });
  } catch (error) {
    console.log("Error adding new movie", error);
    res.status(500).json(error);
  }
});

//GET - ALL MOVIES
//CHECKED AND WORKING
router.get("/all", async (req, res) => {
  try {
    const allMovies = await Movie.find();
    res.json(allMovies);
  } catch (error) {
    console.log("Error retrieving all movies", error);
    res.status(500).json(error);
  }
});

//GET - SINGLE MOVIE BY ID
//CHECKED AND WORKING
router.get("/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId);
    res.json(movie);
  } catch (error) {
    console.log("Error retrieving movie details", error);
    res.status(500).json(error);
  }
});

//PUT - UPDATE MOVIE BY ID - SHOULD BE PROTECTED BY ISAUTH AND ISADMIN
//CHECKED AND WORKING
router.put("/:movieId", isAuth, isAdmin, async (req, res) => {
  try {
    const { movieId } = req.params;
    const {
      title,
      description,
      releaseYear,
      genre,
      cast,
      posterImg,
      backdropImg,
      rating,
      trailerUrl,
      popularity,
    } = req.body;

    const movieData = {
      title,
      description,
      releaseYear,
      genre,
      cast,
      posterImg,
      backdropImg,
      rating,
      trailerUrl,
      popularity,
    };

    for (const property in movieData) {
      if (!movieData[property]) {
        delete movieData.property;
      }
    }

    const updated = await Movie.findByIdAndUpdate(movieId, movieData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Movie was updated successfully", updated });
  } catch (error) {
    console.log("Error editing the movie", error);
    res.status(500).json(error);
  }
});

//DELETE
//CHEKED AND WORKING
router.delete("/:movieId", isAuth, isAdmin, async (req, res) => {
  try {
    const { movieId } = req.params;
    const deleted = await Movie.findByIdAndDelete(movieId);
    res.json({
      message: deleted.title + " movie was deleted successfully",
      deleted,
    });
  } catch (error) {
    console.log("Error deleting the movie", error);
    res.status(500).json(error);
  }
});

export default router;
