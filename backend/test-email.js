require('dotenv').config();
const { sendMail, sendVerificationEmail, sendPasswordResetEmail, sendLowStockAlertEmail } = require('./src/utils/mailer');

async function testNodemailer() {
  console.log('🚀 Testing Nodemailer integration for Pizzeria Bella...\n');
  console.log('Current configuration:');
  console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '(none)');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST || '(none)');
  console.log('  SMTP_USER:', process.env.SMTP_USER || '(none)');
  console.log('  SMTP_FROM:', process.env.SMTP_FROM || '(default)');
  console.log('');

  const targetEmail = process.argv[2] || 'customer@example.com';
  console.log(`📨 Sending test email via Nodemailer to: ${targetEmail}...`);

  const result = await sendMail({
    to: targetEmail,
    subject: '🍕 Pizzeria Bella - Nodemailer Connection Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 12px; overflow: hidden; border: 1px solid #44403c;">
        <div style="background: linear-gradient(135deg, #f43f5e, #ea580c, #f59e0b); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🍕 Pizzeria Bella</h1>
          <p style="color: #fef3c7; margin: 6px 0 0; font-size: 14px; font-weight: bold;">Nodemailer Delivery Engine Verified</p>
        </div>
        <div style="padding: 24px; line-height: 1.6;">
          <h2 style="color: #f59e0b; margin-top: 0;">Nodemailer is Active!</h2>
          <p style="color: #d6d3d1;">
            This email confirms that your <strong>Nodemailer</strong> mailer service in the backend is properly configured and functional.
          </p>
          <div style="background: #292524; padding: 14px; border-radius: 8px; margin: 20px 0; border: 1px solid #44403c;">
            <p style="margin: 4px 0; color: #a8a29e; font-size: 13px;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p style="margin: 4px 0; color: #a8a29e; font-size: 13px;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          </div>
          <p style="color: #78716c; font-size: 12px; margin-top: 20px; border-top: 1px solid #292524; padding-top: 12px;">
            Pizzeria Bella Artisanal Kitchen • Automated Dispatch System
          </p>
        </div>
      </div>
    `,
  });

  if (result.success) {
    console.log('\n✅ Email sent successfully via Nodemailer!');
    console.log('  Message ID:', result.messageId);
    if (result.previewUrl) {
      console.log('  🔗 1-Click Ethereal Inbox Preview URL:');
      console.log('  ' + result.previewUrl);
    }
  } else {
    console.error('\n❌ Nodemailer delivery failed:', result.error);
  }

  process.exit(0);
}

testNodemailer();
