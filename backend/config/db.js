const mongoose =require("mongoose");
const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        });
        console.log("Db is connected BOSS")

    }
    catch(error){
        console.error("Error OPPS",error)
        process.exit(1)
    }
}

module.exports=connectDB