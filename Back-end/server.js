require("dotenv").config();
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
const { app } = require("./src/app");

app.listen(3000, () => {
  console.log("the server run on the port 3000");
});
