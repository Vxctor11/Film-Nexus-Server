import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      maxLength: 34,
      minLength: 4,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      maxLength: 42,
      trim: true,
    },
    password: { type: String, required: true, minLength: 6 },
    profilePic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    watchlist: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
    favorites: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
