const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} text - email plain text body
 */
console.log("RESEND KEY EXISTS:", !!process.env.RESEND_API_KEY);
async function sendEmail(to, subject, text) {
  try {
    // console.log(to, subject, text);
    await resend.emails.send({
      from: "noreply@fixonindia.com", // safe default
      to,
      subject,
      text, // same as before
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email send error:", err);
    throw err;
  }
}

module.exports = { sendEmail };











// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true, // MUST be true
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, 
//   },
// });

// /**
//  * Send email
//  * @param {string} to - recipient email
//  * @param {string} subject - email subject
//  * @param {string} text - email plain text body
//  */
// async function sendEmail(to, subject, text) {
//   try {
//     await transporter.sendMail({
//       from: `"FixOn India" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });
//     return true;
//   } catch (err) {
//     console.error("Email send error:", err.message);
//     return false; // ✅ NEVER throw
//   }
// }
// module.exports = { sendEmail };





























// const axios = require("axios");

// /**
//  * Send email using Brevo API
//  * @param {string} to - recipient email
//  * @param {string} subject - email subject
//  * @param {string} text - email plain text body
//  */
// async function sendEmail(to, subject, text) {
//   try {
//     const res = await axios.post(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         sender: { name: "FixOn India", email: process.env.MAIL_FROM },
//         to: [{ email: to }],
//         subject: subject,
//         htmlContent: `<p>${text}</p>`,
//       },
//       {
//         headers: {
//           "api-key": process.env.BREVO_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return true; // Success
//   } catch (err) {
//     console.error("Email send error:", err.response?.data || err.message);
//     return false; // Never throw, keep same as original
//   }
// }

// module.exports = { sendEmail };
