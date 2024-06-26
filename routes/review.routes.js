import express from "express";
import isAuth from "../middleware/authentication.middleware.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";

const router = express.Router();

//NEW REVIEW - PROTECTED BY ISAUTH
//TESTED AND WORKING
router.post("/:movieId", isAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { title, review, rating } = req.body;

    const createdReview = await Review.create({
      title,
      review,
      rating,
      creator: req.user._id,
      movie: movieId,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );
    await Movie.findByIdAndUpdate(
      movieId,
      { $push: { reviews: createdReview._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Review created succesfully", createdReview });
  } catch (error) {
    console.log("Error while creating review", error);
    res.status(500).json(error);
  }
});

//DELETE REVIEW
//TESTED AND WORKING
router.delete("/:reviewId", isAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!req.user.isAdmin && review.creator.toString() !== req.user._id) {
      return res
        .status(401)
        .json({ message: "You cannot delete another user's review" });
    }

    await Movie.findByIdAndUpdate(review.movie, {
      $pull: { reviews: review._id },
    });

    await User.findByIdAndUpdate(review.creator, {
      $pull: { reviews: review._id },
    });

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Your review has been deleted successfully" });
  } catch (error) {
    console.log("Error while deleting review", error);
    res.status(500).json(error);
  }
});

//EDIT REVIEW
router.put("/:reviewId", isAuth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { title, review, rating } = req.body;
    const reviewData = { title, review, rating };

    for (const property in reviewData) {
      if (!reviewData[property]) {
        delete reviewData.property;
      }
    }

    const updated = await Review.findByIdAndUpdate(reviewId, reviewData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Review was updated successfully", updated });
  } catch (error) {
    console.log("Error editing the review", error);
    res.status(500).json(error);
  }
});

export default router;
