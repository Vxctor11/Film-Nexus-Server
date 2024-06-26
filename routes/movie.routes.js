import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import Movie from "../models/movie.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

const router = express.Router();

//SEARCH
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const movies = await Movie.find({
      title: { $regex: query, $options: "i" },
    });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error searching movies" });
  }
});

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
    const allMovies = await Movie.find().populate({
      path: "reviews",
      populate: { path: "creator" },
    });
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
    const movie = await Movie.findById(movieId).populate({
      path: "reviews",
      populate: { path: "creator" },
    });
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
// need to have the deleted movie ref pulled from the users watch and fave list array
router.delete("/:movieId", isAuth, isAdmin, async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findById(movieId).populate("reviews");

    //Removing reviews on this movie from any users reviews array and deleting the reviews after
    for (const review of movie.reviews) {
      await User.findByIdAndUpdate(review.creator, {
        $pull: { reviews: review._id },
      });
      await Review.findByIdAndDelete(review._id);
    }

    //Removing the movie from users' watchlist
    await User.updateMany(
      { watchlist: movieId },
      { $pull: { watchlist: movieId } }
    );

    //Removing the movie from users' favorites
    await User.updateMany(
      { favorites: movieId },
      { $pull: { favorites: movieId } }
    );

    //Deleting the movie
    const deleted = await Movie.findByIdAndDelete(movieId);
    console.log(deleted);
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
