const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    content:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    comments:[
        {
            user:{type:mongoose.Schema.Types.ObjectId,
              
                ref:"User"},
                content:{type:String, required:true}
        }
    ]
},

{
    timestamps:true,
}


)

const Post = mongoose.model("Post",postSchema)

module.exports=Post