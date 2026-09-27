const cloudinary = require("../configs/cloudinary");

const uploadVideo = (buffer) => {
  return new Promise((res, rej) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "e-learning/lessons",
      },
      (err, result) => {
        if (err) {
          return rej(err);
        }

        res(result);
      },
    );
    stream.end(buffer);
  });
};

module.exports = uploadVideo;
