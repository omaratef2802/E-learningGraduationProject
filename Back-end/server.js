require("dotenv").config();
const { app } = require("./src/app");
const connectDB = require("./src/configs/db");

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`the server run on the port ${PORT}`);
    });
  })
  .catch(() => process.exit(1));
