const mongoose = require("mongoose");
const colors = require("colors");
require("dotenv").config();

const MONGO_URL =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URI
    : process.env.DB_URI;

const connectDB = async () => {
  
  try {
    await mongoose.connect(MONGO_URL);
    console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb Server Issue ${error}`.bgRed.white);
  }
};
//listen port
// app.listen(port, () => {
//   console.log(
//     `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
//   );
// });

module.exports = connectDB;
