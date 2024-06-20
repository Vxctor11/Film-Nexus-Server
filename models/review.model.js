import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 64 },
    review: {
      type: String,
      required: true,
      trim: true,
      maxLength: 448,
      minLength: 24,
    },
    rating: {
      type: Number,
      required: true,
      enum: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
    },
    media: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default model("Review", reviewSchema);
