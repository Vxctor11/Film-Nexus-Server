import express from "express";
import User from "../models/user.model.js";
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

export default router;
