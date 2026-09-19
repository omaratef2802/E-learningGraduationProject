const cloudinary = require('../configs/cloudinary');
const streamifier = require('streamifier');

function uploadVideo(fileBuffer, folder = 'lessons') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
}

module.exports = uploadVideo;