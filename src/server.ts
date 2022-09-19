import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import authRouter from "./routes/auth";
import subsRouter from "./routes/subs";
import postsRouter from "./routes/posts";
import cors from "cors";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import voteRouter from "./routes/votes";

dotenv.config();

const origin = "http://localhost:3000";

const app = express();

app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.get("/", (_, res) => res.send("runningwater"));
app.use("/api/auth", authRouter);
app.use("/api/subs", subsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/votes", voteRouter);

app.use(express.static("public"));

const port = 4000;

app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);

  AppDataSource.initialize()
    .then(() => {
      console.log("database initialized");
    })
    .catch((error) => console.log(error));
});
