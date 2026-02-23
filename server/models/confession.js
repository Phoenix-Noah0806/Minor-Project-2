import mongoose from 'mongoose'
const confessionSchema=new mongoose.Schema({
    anonId:String,
    text:{
        type:String,
        required:true
    },
    vibe:String,
    secretCode:{
        type:String,
        required:true
    },
    userID:String,
    createdAt: {
    type: Date,
    default: Date.now
  }
})
export default mongoose.model("Confession",confessionSchema)