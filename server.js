const express = require("express");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require('morgan');
const userAuditLogger = require('./middlewares/userAuditLogger');
const https = require('https');
const fs = require('fs'); // Update the path accordingly

//rest obejct
const app = express();
// Use morgan for general request logging
app.use(morgan('combined'));

// Use your custom user audit logger middleware
app.use(userAuditLogger);
//dotenv conig
dotenv.config();

//mongodb connection
connectDB();



//middlewares
app.use(express.json());
app.use(moragan("dev"));

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));


//port
const port = process.env.PORT || 8001;
//listen port
// app.listen(port, () => {
//   console.log(
//     `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
//   );
// });
https.createServer({
  cert: fs.readFileSync('./localhost.crt'),
  key: fs.readFileSync('./localhost.key')
},app ).listen(8001);

module.exports = app;



