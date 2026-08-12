const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect((process.env.MONGO_URI||
      "mongodb://localhost:27017/socialmedia"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("db is connected BOSS")
  }
  catch (error) {
    console.error("Error OPPS",error)
      process.exit(1)
  }
}

module.exports = connectDB;