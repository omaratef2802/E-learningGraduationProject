require("dotenv").config();

console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { app } = require("./src/app");
const { initSocket } = require("./src/controllers/Notification");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

initSocket(io);

mongoose.connect(process.env.URL_MONGO)
  .then(() => {
    console.log("the db runing successfuly");

    server.listen(3000, () => {
      console.log("the server run on the port 3000");
    });
  })
  .catch((err) => {
    console.log("DB Error:", err.message);
  });