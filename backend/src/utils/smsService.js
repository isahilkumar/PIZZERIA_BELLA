const nodemailer = require('nodemailer');

/**
 * Pizzeria Bella Universal SMS Dispatcher
 * Supports:
 *  1. Fast2SMS (Free India Quick OTP Gateway) - https://www.fast2sms.com
 *  2. Twilio (Global SMS Gateway) - https://www.twilio.com
 *  3. 2Factor.in (India Telecom DLT/OTP Gateway) - https://2factor.in
 *  4. Email Bridge Fallback (Dispatches OTP to configured Gmail SMTP so you always receive it)
 */

const sendRealSmsOtp = async (phone, otp) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const tenDigitPhone = cleanPhone.slice(-10);
  let smsSent = false;
  let providerUsed = 'Simulator / Preview';

  // 1. Fast2SMS (India Free/Paid Gateway)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey && tenDigitPhone.length === 10) {
    try {
      console.log(`📡 [Fast2SMS] Dispatching OTP ${otp} to +91${tenDigitPhone}...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: tenDigitPhone,
        }),
      });

      const result = await response.json();
      console.log('📡 [Fast2SMS Result]:', result);
      if (result.return) {
        smsSent = true;
        providerUsed = 'Fast2SMS Gateway';
      }
    } catch (err) {
      console.error('❌ Fast2SMS dispatch failed:', err.message);
    }
  }

  // 2. Twilio SMS Gateway
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (!smsSent && twilioSid && twilioAuth && twilioFrom) {
    try {
      const e164Phone = phone.startsWith('+') ? phone : `+91${tenDigitPhone}`;
      console.log(`📡 [Twilio] Dispatching SMS to ${e164Phone}...`);
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const creds = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');

      const bodyData = new URLSearchParams({
        To: e164Phone,
        From: twilioFrom,
        Body: `🍕 Your Pizzeria Bella verification code is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`,
      });

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyData.toString(),
      });

      const result = await response.json();
      console.log('📡 [Twilio Result]:', result.status || result.message);
      if (result.sid) {
        smsSent = true;
        providerUsed = 'Twilio SMS';
      }
    } catch (err) {
      console.error('❌ Twilio dispatch failed:', err.message);
    }
  }

  // 3. 2Factor.in Gateway
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;
  if (!smsSent && twoFactorKey && tenDigitPhone.length === 10) {
    try {
      console.log(`📡 [2Factor] Dispatching OTP to +91${tenDigitPhone}...`);
      const url = `https://2factor.in/v3/${twoFactorKey}/SMS/+91${tenDigitPhone}/${otp}/OTP_VERIFY`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.Status === 'Success') {
        smsSent = true;
        providerUsed = '2Factor.in SMS';
      }
    } catch (err) {
      console.error('❌ 2Factor dispatch failed:', err.message);
    }
  }

  // 4. Backup Notification: Dispatch to Admin/User Email (Gmail SMTP)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Pizzeria Bella Security" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: `🔑 [OTP Code] Mobile Verification for +91 ${tenDigitPhone}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #f97316; border-radius: 16px; background: #fffaf5;">
            <h2 style="color: #ea580c; margin-top: 0;">🍕 Pizzeria Bella Mobile OTP</h2>
            <p style="color: #4b5563; font-size: 14px;">A mobile verification code was requested for: <strong>+91 ${tenDigitPhone}</strong></p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #1c1917; background: #ffedd5; padding: 16px; border-radius: 12px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 12px;">This verification code is valid for 10 minutes. If you did not request this code, please ignore this message.</p>
          </div>
        `,
      });
      console.log(`📧 [EMAIL BACKUP] Dispatched OTP ${otp} notification to ${process.env.SMTP_USER}`);
    } catch (emailErr) {
      console.warn('⚠️ Could not send backup OTP email notification:', emailErr.message);
    }
  }

  return {
    success: true,
    smsSent,
    providerUsed,
  };
};

module.exports = {
  sendRealSmsOtp,
};
