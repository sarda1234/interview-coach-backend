const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sarda.ashwin@gmail.com",
    pass: "qpkq uxnj knte yyis",
  },
});

async function sendTokenEmail(customerEmail, token) {
  const link = `https://interview-coach-frontend-nu.vercel.app/?token=${token}`;

  await transporter.sendMail({
    from: '"AI Interview Coach" <sarda.ashwin@gmail.com>',
    to: customerEmail,
    subject: "Your AI Interview Coach Access Link 🎯",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f3f4f6;">
        <div style="background: #1e3a5f; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎯 AI Interview Coach</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 24px;">
          <h2 style="color: #1e3a5f;">Your session is ready!</h2>
          <p style="color: #374151; line-height: 1.6;">Thank you for purchasing AI Interview Coach. Click the button below to start your mock interview session.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background: #f59e0b; color: #111; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Start My Interview →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">⚠️ This link is unique to you and can only be used once. Do not share it with others.</p>
          <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link:<br>
          <a href="${link}" style="color: #2d6a9f;">${link}</a></p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">AI Interview Coach • Practice like it's real. Perform like a pro.</p>
      </div>
    `,
  });
}

module.exports = { sendTokenEmail };