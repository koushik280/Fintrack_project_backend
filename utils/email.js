const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your FinTrack Password</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .button { width: 100% !important; display: block !important; }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header with brand gradient and logo -->
        <div style="background: linear-gradient(135deg, #0F4C5F 0%, #1A6F87 100%); padding: 32px 20px; text-align: center;">
          <!-- Inline SVG logo (same as your app) -->
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 12px;">
            <rect width="48" height="48" rx="12" fill="white"/>
            <path d="M24 14L26 12L32 18L26 24L20 18L24 14Z" fill="#0F4C5F" stroke="#0F4C5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px; vertical-align: middle;">FinTrack</span>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 32px;">
          <h2 style="color: #0F4C5F; margin-top: 0; font-size: 28px; font-weight: 600;">Forgot Your Password?</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset the password for your FinTrack account. 
            If you made this request, click the button below to set a new password.
          </p>
          
          <!-- Call to Action Button (solid color for better readability) -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background-color: #FF6B4A; 
                      color: #ffffff; 
                      padding: 14px 28px; 
                      border-radius: 40px; 
                      text-decoration: none; 
                      font-weight: 600; 
                      font-size: 18px; 
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(255,107,74,0.3);
                      transition: all 0.2s ease;">
              Reset My Password
            </a>
          </div>
          
          <!-- Expiry Notice with brand accent -->
          <div style="background-color: #FFF8E7; border-left: 4px solid #FF6B4A; padding: 16px; border-radius: 12px; margin: 28px 0;">
            <p style="color: #4A5568; font-size: 14px; margin: 0;">
              <strong>⏰ This link expires in 1 hour.</strong> If you didn't request this, please ignore this email or contact support.
            </p>
          </div>
          
          <!-- Alternative Text -->
          <p style="color: #666666; font-size: 14px; margin-top: 28px;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="background-color: #F0F2F5; padding: 12px; border-radius: 8px; word-break: break-all; font-size: 13px;">
            <a href="${resetUrl}" style="color: #0F4C5F; text-decoration: none;">${resetUrl}</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #FAFBFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center;">
          <p style="color: #94A3B8; font-size: 13px; margin: 0;">
            &copy; 2026 FinTrack. All rights reserved.
          </p>
          <p style="color: #94A3B8; font-size: 12px; margin-top: 8px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

  const mailOptions = {
    from: `"FinTrack Support" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "🔐 Reset Your FinTrack Password",
    html: htmlContent,
  };
  await transport.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
