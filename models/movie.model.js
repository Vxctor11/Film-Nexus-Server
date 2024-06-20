import { Schema, model } from "mongoose";

const movieSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    genres: [{ type: String }],
    cast: [{ type: String }],
    posterImg: { type: String, required: true },
    rating: { type: Number }, // Can be used to implement a "top rated" section on homepage
    trailerUrl: { type: String },
    popularity: { type: Number }, //Thinking of using this to implement a "most popular" section on homepage. Using tmdb to generate this number.
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  },
  {
    timestamps: true,
  }
);

export default model("Movie", movieSchema);
