const nodemailer = require("nodemailer");

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send verification email with token
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p style="font-size: 12px; color: #777;">Verification link expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #777;">This link expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Send contact form submission email to admin
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - User's name
 * @param {string} contactData.email - User's email
 * @param {string} [contactData.phone] - User's phone number
 * @param {string} [contactData.company] - User's company
 * @param {string} [contactData.service] - Service interested in
 * @param {string} contactData.message - User's message
 * @returns {Promise<void>}
 */
const sendContactEmail = async (contactData) => {
  const { name, email, phone, company, service, message } = contactData;
  const adminEmail = process.env.CONTACT_EMAIL_TO || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'} Contact Form" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        ${service ? `<p><strong>Service Interested In:</strong> ${service}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-line; background: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
        <hr>
        <p style="font-size: 12px; color: #777;">
          This message was sent from the contact form on ${process.env.APP_NAME || 'your website'}.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Contact form email sent to admin (${adminEmail})`);
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw new Error("Failed to send contact email");
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail, // Added the new function
  transporter, // Exporting for testing purposes
};