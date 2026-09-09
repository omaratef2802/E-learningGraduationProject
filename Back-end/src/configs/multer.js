const multer = require("multer");
let storage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file.mimetype);
    let ext = file.mimetype.split("/")[1];
    console.log(ext);
    cb(null, req.id + "." + ext);
  },
  destination: "./uploads",
});
const upload = multer({
  storage: storage,
});

module.exports = upload;
