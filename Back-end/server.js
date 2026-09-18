require("dotenv").config();

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

const mongoose = require("mongoose");
const { app } = require("./src/app");

mongoose.connect(process.env.URL_MONGO)
  .then(() => {
    console.log("the db runing successfuly");

    app.listen(3000, () => {
      console.log("the server run on the port 3000");
    });
  })
  .catch((err) => {
    console.log("DB Error:", err.message);
  });