import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import confessionRoutes from './routes/confessionRoutes.js'
import createStatsRouter from "./routes/statsRoutes.js";
dotenv.config();

const app = express();
connectDB()

const activePlayers = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../client")));
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.user?.id) {
    activePlayers.set(req.user.id, Date.now());
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/confessions", confessionRoutes);
app.use("/stats", createStatsRouter({ activePlayers }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(3000, () => console.log("Server running"));
