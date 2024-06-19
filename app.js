import express from "express";
import morgan from "morgan";
import connectDB from "./config/mongoose.config.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const logger = morgan("dev");


// MIDDLEWARE:
app.use(
    cors({
        origin: ["http://localhost:5173"]
    })
);
app.use(express.json());
app.use(logger);
//ADD APP.USE ROUTES HERE


// START THE SERVER:
app.listen(process.env.PORT, () => {
  console.clear();
  console.log("Server is up and running on port: ", process.env.PORT);
  connectDB();
});
