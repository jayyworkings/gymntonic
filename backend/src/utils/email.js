const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'GymNTonic <noreply@gymntonic.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
    // Don't throw — email failure shouldn't block operations
    return null;
  }
};

/**
 * Order confirmation email template
 */
const sendOrderConfirmation = async (user, order) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #ff0066;">GymNTonic - Order Confirmation</h1>
      <p>Hi ${user.first_name},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">#${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">$${order.total_amount}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.status}</td>
        </tr>
      </table>
      <p>We'll send you another email when your order ships.</p>
      <p style="color: #888; font-size: 12px;">GymNTonic Supplements | gymntonic.com</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order.id} - GymNTonic`,
    html,
  });
};

/**
 * Payment received email
 */
const sendPaymentConfirmation = async (user, payment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #00cc66;">Payment Received</h1>
      <p>Hi ${user.first_name},</p>
      <p>We've received your payment of <strong>$${payment.amount}</strong>.</p>
      <p>Reference: ${payment.reference}</p>
      <p>Thank you for shopping with GymNTonic!</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Payment Confirmed - GymNTonic`,
    html,
  });
};

module.exports = { sendEmail, sendOrderConfirmation, sendPaymentConfirmation };
