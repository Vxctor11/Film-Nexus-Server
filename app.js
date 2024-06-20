import express from "express";
import morgan from "morgan";
import connectDB from "./config/mongoose.config.js";
import * as dotenv from "dotenv";
import cors from "cors";
import movieRouter from "./routes/movie.routes.js";
import userRouter from "./routes/user.routes.js";
import reviewRouter from "./routes/review.routes.js";

dotenv.config();

const app = express();
const logger = morgan("dev");

// MIDDLEWARE:
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());
app.use(logger);

app.use("/user", userRouter);
app.use("/movie", movieRouter);
app.use("/review", reviewRouter);

// START THE SERVER:
app.listen(process.env.PORT, () => {
  console.clear();
  console.log("Server is up and running on port: ", process.env.PORT);
  connectDB();
});
