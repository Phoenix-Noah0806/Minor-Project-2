import express from "express";
import passport from "../config/passport.js";

const router = express.Router();

router.get("/google",
  passport.authenticate("google", { scope: ["profile","email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/app.html");
  }
);

router.get("/user",(req,res)=>{
  res.json(req.user || null);
});

router.get("/logout",(req,res)=>{
  req.logout(()=> res.redirect("/"));
});

export default router;