import express from 'express'
import Confession from '../models/confession.js'

const router=express.Router()

// Creating a confession 

router.post('/',async(req ,res)=>{
  if(!req.user){
    return res.status(401).json({message:"Log In Required!!!"})
  }
  const{text,vibe,secretCode,tags}=req.body
  const anonId="Anon" + Math.floor(10000+Math.random()*90000)
  const confession=await Confession.create({
    anonId,
    text,
    vibe,
    tags:tags || [],
    secretCode,
    userID:req.user.id
  })
  res.json(confession)
})

router.get('/',async (req ,res)=>{
  const data=await Confession.find().sort({ createdAt: -1 })
  res.json(data)
})
router.get("/my", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Login required" });
  }

  const posts = await Confession.find({ userID: req.user.id })
    .sort({ createdAt: -1 });

  res.json(posts);
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