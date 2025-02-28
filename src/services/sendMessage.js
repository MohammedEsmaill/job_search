import nodemailer from "nodemailer";

export const sendMessage = async (email, subject, html, attchments) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: `"AboHadida👻" <${process.env.EMAIL}>`,
    to: email ? email : "abohadida51@gmail.com",
    subject: subject ? subject : "Hello ✔",
    html: html ? html : "<h1>Hello world?</h1>",
    attachments: attchments ? attchments : []
  });
  if (info.accepted.length) {
    return true
  }
  return false;
}
