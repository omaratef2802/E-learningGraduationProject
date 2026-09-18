const Certificate = require("../modules/dbCertificate");
const crypto = require("crypto");
exports.generateCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const existingCertificate = await Certificate.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: "Certificate already exists",
        data: existingCertificate,
      });
    }

    const certificateId = "CERT-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const verificationUrl = `https://yourplatform.com/verify-certificate/${certificateId}`;
    const qrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const certificate = await Certificate.create({
      student: studentId,
      course: courseId,
      certificateId,
      verificationUrl,
      qrCode,
    });

    return res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  } catch (error) {
    console.error("Error generating certificate:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate("student", "firstName lastName email")
      .populate("course", "title");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Invalid Certificate ID. Certificate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Certificate is authentic and valid.",
      data: certificate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.id;
    const certificates = await Certificate.find({ student: studentId }).populate("course", "title");

    return res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};