import express from "express";
import User from "../models/user.model.js";
import Movie from "../models/movie.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import isAuth from "../middleware/authentication.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
const router = express.Router();

//SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    //Handling if user does not provide either email/username/password
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Please provide email, username, and password." });
    }

    //Checking if username/email is taken
    const foundUser = await User.findOne({ $or: [{ email }, { username }] });
    if (foundUser) {
      return res.status(400).json({
        message: "The email or username you entered is already taken.",
      });
    }

    // Regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address." });
      return;
    }

    // Use regex to validate the password format
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{6,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase, one uppercase letter and a special character.",
      });
      return;
    }

    //Hashing password if user has passed the email and password regex
    const salts = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salts);

    //Creating the user using the email, username, and hashed password
    const createdUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully", createdUser });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    //Checking if user provided email/username and password
    if (!(email || username) || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email or username, and password." });
    }

    //Checking if user exists
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(401).json({ message: "User does not exist." });
    }

    //Compare inputted password to password stored in db
    const passwordCheck = await bcrypt.compare(password, user.password);

    //Message returned if password incorrect
    if (!passwordCheck) {
      return res
        .status(401)
        .json({ message: "Email/Username or password incorrect." });
    }

    //Delete password from user variable so the user can be used as payload
    delete user._doc.password;

    //Using jwt.sign() to create token on login. This is signed using: payload, SECRET token in .env, algorithm, and expiresIn
    const jwtToken = jwt.sign(
      { payload: user },
      process.env.TOKEN_SIGN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "24h",
      }
    );
    res.json({ user, jwtToken });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//VERIFY with isAuth middleware
router.get("/verify", isAuth, async (req, res) => {
  try {
    res.json({ message: "User is logged in.", user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/admin", isAuth, isAdmin, async (req, res) => {
  try {
    res.json({ message: "Admin is logged in and verified.", user: req.user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

////////////////// ROUTES TO ADD/REMOVE FROM WATCHLIST AND FAVORITES //////////////
//MIGHT REMOVE MESSAGE ON LINE 148-150 AND 201-203 SINCE OPTION WOULDNT BE ON FRONT END ANYWAY

//ADD TO WATCHLIST
router.post("/watchlist/:movieId", isAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const user = await User.findById(userId);

    if (user.watchlist.includes(movieId)) {
      return res.status(400).json({ message: "Movie already in watchlist" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { watchlist: movieId } },
      { new: true }
    ).populate("watchlist");

    res.json({
      message: "Movie added to watchlist",
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.log("Error adding movie to watchlist", error);
    res.status(500).json(error);
  }
});

//REMOVE FROM WATCHLIST
router.delete("/watchlist/:movieId", isAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { watchlist: movieId } },
      { new: true }
    );

    res.json({ message: "Movie removed from watchlist" });
  } catch (error) {
    console.log("Error removing movie from watchlist", error);
    res.status(500).json(error);
  }
});

//ADD MOVIE TO FAVORITES
router.post("/favorites/:movieId", isAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const user = await User.findById(userId);

    if (user.favorites.includes(movieId)) {
      return res.status(400).json({ message: "Movie already in favorites" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: movieId } },
      { new: true }
    ).populate("favorites");

    res.json({
      message: "Movie added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.log("Error adding movie to Favorites", error);
    res.status(500).json(error);
  }
});

//REMOVE MOVIE FROM FAVORITES:
router.delete("/favorites/:movieId", isAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: movieId } },
      { new: true }
    );

    res.json({ message: "Movie removed from favorites." });
  } catch (error) {
    console.log("Error removing movie from favorites", error);
    res.status(500).json(error);
  }
});

export default router;
