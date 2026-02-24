import express from "express";
import Confession from "../models/confession.js";

const router = express.Router();

// Creating a confession

router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Log In Required!!!" });
  }
  const { text, vibe, secretCode, tags } = req.body;
  const anonId = "Anon" + Math.floor(10000 + Math.random() * 90000);
  const confession = await Confession.create({
    anonId,
    text,
    vibe,
    tags: tags || [],
    secretCode,
    userID: req.user.id,
  });
  res.json(confession);
});

router.get("/", async (req, res) => {
  const data = await Confession.find().sort({ createdAt: -1 });
  res.json(data);
});
router.get("/my", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }

  const posts = await Confession.find({ userID: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(posts);
});
router.post("/:id/react", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Login required" });

    const { type } = req.body;
    const validTypes = ["heart", "laugh", "sad"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid reaction type" });
    }

    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ message: "Not found" });

    if (!confession.reactions) {
      confession.reactions = { heart: 0, laugh: 0, sad: 0 };
    }

    if (confession.reactions.heart == null) confession.reactions.heart = 0;
    if (confession.reactions.laugh == null) confession.reactions.laugh = 0;
    if (confession.reactions.sad == null) confession.reactions.sad = 0;

    if (!Array.isArray(confession.reactedUsers)) {
      confession.reactedUsers = [];
    }
    confession.reactedUsers = confession.reactedUsers.filter(
      (r) =>
        r &&
        typeof r === "object" &&
        typeof r.userID === "string" &&
        validTypes.includes(r.type)
    );

    const existingIndex = confession.reactedUsers.findIndex(
      (r) => r?.userID === req.user.id
    );

    if (existingIndex >= 0) {
      const previousType = confession.reactedUsers[existingIndex]?.type;

      if (previousType === type) {
        return res.json({
          reactions: confession.reactions,
          userReaction: previousType,
        });
      }

      if (
        validTypes.includes(previousType) &&
        confession.reactions[previousType] > 0
      ) {
        confession.reactions[previousType] -= 1;
      }
      confession.reactions[type] += 1;

      confession.reactedUsers[existingIndex].type = type;
    } else {
      confession.reactions[type] += 1;
      confession.reactedUsers.push({
        userID: req.user.id,
        type,
      });
    }

    await confession.save();

    res.json({
      reactions: confession.reactions,
      userReaction: type,
    });
  } catch (err) {
    console.log("REACT ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.post("/:id/comment", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Login required" });

  const { text } = req.body;

  const confession = await Confession.findById(req.params.id);
  if (!confession) return res.status(404).json({ message: "Not found" });

  confession.comments.push({
    text,
    userID: req.user.id
  });

  await confession.save();
  res.json(confession.comments);
});
router.put("/:id", async (req, res) => {
  const { secretCode, text } = req.body;

  const confession = await Confession.findById(req.params.id);

  if (!confession) return res.status(404).json({ message: "Not found" });

  if (confession.secretCode !== secretCode)
    return res.status(401).json({ message: "Wrong secret code" });

  confession.text = text;
  await confession.save();

  res.json({ message: "Updated" });
});
router.delete("/:id", async (req, res) => {
  const { secretCode } = req.body;

  const confession = await Confession.findById(req.params.id);

  if (!confession) return res.status(404).json({ message: "Not found" });

  if (confession.secretCode !== secretCode)
    return res.status(401).json({ message: "Wrong secret code" });

  await confession.deleteOne();

  res.json({ message: "Deleted" });
});

export default router;


