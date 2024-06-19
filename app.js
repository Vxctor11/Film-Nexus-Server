import express from "express";
import morgan from "morgan";
import connectDB from "./config/mongoose.config.js";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const logger = morgan("dev");

app.use(express.json());
app.use(logger);

//NEED TO CONFIGURE CORS HERE??

//ADD APP.USE ROUTES HERE

app.listen(process.env.PORT, () => {
  console.clear();
  console.log("Server is up and running on port: ", process.env.PORT);
  connectDB();
});
