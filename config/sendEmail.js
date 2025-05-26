// const nodemailer = require("nodemailer");

// // Create reusable transporter object
// const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE || "gmail",
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: parseInt(process.env.SMTP_PORT) || 587,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// /**
//  * Send verification email with token
//  * @param {string} email - Recipient email
//  * @param {string} token - Verification token
//  * @returns {Promise<void>}
//  */
// const sendVerificationEmail = async (email, token) => {
//   const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

//   const mailOptions = {
//     from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Verify Your Email",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">Email Verification</h2>
//         <p>Please click the button below to verify your email address:</p>
//         <a href="${verificationUrl}" 
//            style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
//           Verify Email
//         </a>
//         <p>If you didn't create an account, please ignore this email.</p>
//         <p style="font-size: 12px; color: #777;">Verification link expires in 1 hour.</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Verification email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//     throw new Error("Failed to send verification email");
//   }
// };

// /**
//  * Send password reset email
//  * @param {string} email - Recipient email
//  * @param {string} token - Reset token
//  * @returns {Promise<void>}
//  */
// const sendPasswordResetEmail = async (email, token) => {
//   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

//   const mailOptions = {
//     from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Password Reset Request",
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">Password Reset</h2>
//         <p>You requested a password reset. Click the button below to set a new password:</p>
//         <a href="${resetUrl}" 
//            style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
//           Reset Password
//         </a>
//         <p>If you didn't request this, please ignore this email.</p>
//         <p style="font-size: 12px; color: #777;">This link expires in 1 hour.</p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Password reset email sent to ${email}`);
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     throw new Error("Failed to send password reset email");
//   }
// };

// /**
//  * Send contact form submission email to admin
//  * @param {Object} contactData - Contact form data
//  * @param {string} contactData.name - User's name
//  * @param {string} contactData.email - User's email
//  * @param {string} [contactData.phone] - User's phone number
//  * @param {string} [contactData.company] - User's company
//  * @param {string} [contactData.service] - Service interested in
//  * @param {string} contactData.message - User's message
//  * @returns {Promise<void>}
//  */
// const sendContactEmail = async (contactData) => {
//   const { name, email, phone, company, service, message } = contactData;
//   const adminEmail = process.env.CONTACT_EMAIL_TO || process.env.EMAIL_USER;

//   const mailOptions = {
//     from: `"${process.env.APP_NAME || 'Your App'} Contact Form" <${process.env.EMAIL_USER}>`,
//     to: adminEmail,
//     subject: `New Contact Form Submission from ${name}`,
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #333;">New Contact Form Submission</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
//         ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
//         ${service ? `<p><strong>Service Interested In:</strong> ${service}</p>` : ''}
//         <p><strong>Message:</strong></p>
//         <p style="white-space: pre-line; background: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
//         <hr>
//         <p style="font-size: 12px; color: #777;">
//           This message was sent from the contact form on ${process.env.APP_NAME || 'your website'}.
//         </p>
//       </div>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Contact form email sent to admin (${adminEmail})`);
//   } catch (error) {
//     console.error("Error sending contact email:", error);
//     throw new Error("Failed to send contact email");
//   }
// };
// // Send confirmation to user
// const sendUserConfirmation = async (email, name, subject) => {
//   try {
//     await transporter.sendMail({
//       from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject: 'Message Received',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #333;">Hello ${name},</h2>
//           <p>Thank you for contacting us. We have received your message regarding "${subject}" and will get back to you soon.</p>
//           <p>Best regards,</p>
//           <p>${process.env.EMAIL_SENDER_NAME}</p>
//         </div>
//       `
//     });
//   } catch (error) {
//     console.error('Error sending user confirmation email:', error);
//     throw error;
//   }
// };

// // Send notification to admin
// const sendAdminNotification = async (messageData) => {
//   try {
//     await transporter.sendMail({
//       from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       subject: 'New Message Received',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #333;">New Message from ${messageData.name}</h2>
//           <p><strong>Email:</strong> ${messageData.email}</p>
//           <p><strong>Subject:</strong> ${messageData.subject}</p>
//           <p><strong>Message:</strong></p>
//           <p style="white-space: pre-line; background: #f5f5f5; padding: 10px; border-radius: 5px;">
//             ${messageData.message}
//           </p>
//         </div>
//       `
//     });
//   } catch (error) {
//     console.error('Error sending admin notification email:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
//   sendAdminNotification,
//   sendUserConfirmation,
//   sendContactEmail, // Added the new function
//   transporter, // Exporting for testing purposes
// };

const nodemailer = require("nodemailer");
const Newsletter = require("../models/newsletter");
const config = require("../config/config");

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || config.email.service || "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587, // Fixed typo from EMAIL_HOST to SMTP_PORT
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || config.email.user,
    pass: process.env.EMAIL_PASS || config.email.password,
  },
});

// Email to newsletter subscriber
const sendUserSubscriptionEmail = async (userEmail) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Newsletter Team'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: userEmail,
      subject: 'Thank you for subscribing to our newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to our Newsletter!</h2>
          <p>Thank you for subscribing to our newsletter. We're excited to keep you updated with our latest offers and news.</p>
          <p>You'll receive our best content directly in your inbox.</p>
          <p>If you didn't request this subscription, please ignore this email.</p>
          <br>
          <p>Best regards,</p>
          <p>The ${process.env.APP_NAME || 'Newsletter'} Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Newsletter subscription email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending user subscription email:', error);
    throw new Error("Failed to send subscription email");
  }
};

// Email to admin about new newsletter subscription
const sendAdminNotificationEmail = async (userEmail, source) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Newsletter System'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: process.env.ADMIN_EMAIL || config.adminEmail,
      subject: 'New Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Subscriber Alert</h2>
          <p>A new user has subscribed to your newsletter:</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Source:</strong> ${source || 'website'}</p>
          <p><strong>Subscription Date:</strong> ${new Date().toLocaleString()}</p>
          <br>
          <p>View all subscribers in your admin panel.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent for new subscriber ${userEmail}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw new Error("Failed to send admin notification");
  }
};

// Weekly stats email to admin
const sendWeeklyStatsEmail = async (stats) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Newsletter System'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: process.env.ADMIN_EMAIL || config.adminEmail,
      subject: 'Weekly Newsletter Statistics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Weekly Newsletter Report</h2>
          <p>Here's your weekly newsletter subscription statistics:</p>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Summary</h3>
            <p><strong>New subscribers this week:</strong> ${stats.newSubscribers}</p>
            <p><strong>Total subscribers:</strong> ${stats.totalSubscribers}</p>
          </div>
          
          ${stats.weeklySourceStats && stats.weeklySourceStats.length > 0 ? `
          <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Sources This Week</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #ddd;">
                  <th style="text-align: left; padding: 8px;">Source</th>
                  <th style="text-align: left; padding: 8px;">Subscribers</th>
                </tr>
              </thead>
              <tbody>
                ${stats.weeklySourceStats.map(stat => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">${stat.source}</td>
                    <td style="padding: 8px;">${stat.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <p>Have a great week!</p>
          <p>The ${process.env.APP_NAME || 'Newsletter'} Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Weekly stats email sent to admin');
  } catch (error) {
    console.error('Error sending weekly stats email:', error);
    throw new Error("Failed to send weekly stats email");
  }
};

// Send verification email with token
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER || config.email.user}>`,
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

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER || config.email.user}>`,
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

// Send contact form submission email to admin
const sendContactEmail = async (contactData) => {
  const { name, email, phone, company, service, message } = contactData;
  const adminEmail = process.env.CONTACT_EMAIL_TO || process.env.ADMIN_EMAIL || config.adminEmail;

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'Your App'} Contact Form" <${process.env.EMAIL_USER || config.email.user}>`,
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

// Send confirmation to user after contact form submission
const sendUserConfirmation = async (email, name, subject) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: email,
      subject: 'Message Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${name},</h2>
          <p>Thank you for contacting us. We have received your message regarding "${subject}" and will get back to you soon.</p>
          <p>Best regards,</p>
          <p>${process.env.EMAIL_SENDER_NAME || process.env.APP_NAME || 'Our Team'}</p>
        </div>
      `
    });
    console.log(`Contact confirmation sent to ${email}`);
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
    throw new Error("Failed to send user confirmation");
  }
};

// Send notification to admin about new message
const sendAdminNotification = async (messageData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_SENDER_NAME || process.env.APP_NAME || 'Your App'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: process.env.ADMIN_EMAIL || config.adminEmail,
      subject: 'New Message Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Message from ${messageData.name}</h2>
          <p><strong>Email:</strong> ${messageData.email}</p>
          <p><strong>Subject:</strong> ${messageData.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line; background: #f5f5f5; padding: 10px; border-radius: 5px;">
            ${messageData.message}
          </p>
        </div>
      `
    });
    console.log(`Admin notification sent about message from ${messageData.email}`);
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw new Error("Failed to send admin notification");
  }
};

// Admin stats report email (comprehensive version)
const sendAdminStatsReportEmail = async (stats, recentSubscribers = []) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Newsletter System'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: process.env.ADMIN_EMAIL || config.adminEmail,
      subject: `Newsletter Statistics Report - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
          <h1 style="color: #2563eb; text-align: center;">Newsletter Statistics Report</h1>
          <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
          
          <!-- Summary Stats -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h2 style="margin-top: 0; color: #2563eb;">Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #4b5563;">Total Subscribers</h3>
                <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0;">${stats.totalSubscribers}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #4b5563;">Active Subscribers</h3>
                <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 10px 0;">${stats.activeSubscribers}</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #4b5563;">Recent (30d)</h3>
                <p style="font-size: 24px; font-weight: bold; color: #f59e0b; margin: 10px 0;">${stats.recentSubscribers}</p>
              </div>
            </div>
          </div>
          
          <!-- Sources Breakdown -->
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h2 style="margin-top: 0; color: #2563eb;">Subscription Sources</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #e2e8f0;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Source</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Subscribers</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${stats.sources.map(source => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${source._id || 'Unknown'}</td>
                    <td style="padding: 12px;">${source.count}</td>
                    <td style="padding: 12px;">${Math.round((source.count / stats.totalSubscribers) * 100)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Recent Subscribers -->
          ${recentSubscribers.length > 0 ? `
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h2 style="margin-top: 0; color: #2563eb;">Recent Subscribers</h2>
            <p style="color: #64748b;">Last ${recentSubscribers.length} subscribers</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #e2e8f0;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Email</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Source</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e0;">Date</th>
                </tr>
              </thead>
              <tbody>
                ${recentSubscribers.map(sub => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px;">${sub.email}</td>
                    <td style="padding: 12px;">${sub.source || 'website'}</td>
                    <td style="padding: 12px;">${new Date(sub.subscribedAt).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #64748b; font-size: 14px;">
            <p>This report was automatically generated by the ${process.env.APP_NAME || 'Newsletter'} System</p>
            <p>You can adjust report settings in the admin dashboard.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin stats report email sent successfully');
  } catch (error) {
    console.error('Error sending admin stats report:', error);
    throw new Error('Failed to send admin stats report');
  }
};

// Testimonial submission email to user
const sendTestimonialSubmissionEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Testimonial Team'}" <${process.env.EMAIL_USER || config.email.user}>`,
      to: userEmail,
      subject: 'Thank You for Your Testimonial!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Hi ${userName},</h2>
          <p>We've received your testimonial and truly appreciate you taking the time to share your experience with us.</p>
          <p>Our team will review your submission, and if approved, it will be displayed on our website.</p>
          <p>Thank you for being part of our community!</p>
          <br>
          <p>Best regards,</p>
          <p>The ${process.env.APP_NAME || 'Testimonial'} Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Testimonial confirmation sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending testimonial confirmation:', error);
    throw new Error('Failed to send testimonial confirmation');
  }
};


module.exports = {
  transporter,
  sendUserSubscriptionEmail,
  sendAdminNotificationEmail,
  sendWeeklyStatsEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactEmail,
  sendUserConfirmation,
  sendAdminNotification,
  sendAdminStatsReportEmail,
  sendTestimonialSubmissionEmail
};