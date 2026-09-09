const transport = require("../configs/email");
// const sendEmail = transport;
const sendEmail = async (to, subject, html) => {
  const mailOption = {
    to,
    subject,
    html,
  };
  return await transport.sendMail(mailOption);
};

module.exports = sendEmail;
