const Notification = require("../models/Notification");

const notifyEnrollment = async (studentId, course) => {

    return await Notification.create({
        userId: studentId,

        title: "Enrollment Successful",

        message: `You have successfully enrolled in "${course.title}".`,

        type: "course",

        referenceId: course._id,
    });
};

module.exports = {
    notifyEnrollment,
};