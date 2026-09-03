import { Resend } from 'resend';
import config from '../config/server-config.js';

// Initialize Resend only if API key is available
const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

export const sendEmail = async (to, subject, text) => {
  if (!config.RESEND_API_KEY || !resend) {
    console.warn('⚠️  RESEND_API_KEY not set - skipping email to:', to);
    return;
  }
  try {
    // Convert plain text to clean HTML
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
        ${text.split('\n').map(line => line.trim() === '' ? '<br/>' : `<p style="margin:0 0 12px;text-align:left;">${line}</p>`).join('')}
      </div>
    `;
    await resend.emails.send({
      from: 'Infinito Comics <tech@infinitohq.com>',
      to,
      subject,
      text,
      html,
    });
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

export const sendForgotPasswordEmail = async (toEmail, resetLink, userName) => {
  if (!config.RESEND_API_KEY || !resend) {
    console.warn('⚠️  RESEND_API_KEY not set - skipping forgot password email to:', toEmail);
    return;
  }
  
  try {
    await resend.emails.send({
      from: 'Infinito Comics <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Reset Your Password - Infinito Comics',
      html: `
        <div style="font-family:sans-serif; max-width:600px; margin:auto;">
          <h2 style="color:#DD1215;">Hi ${userName || ''},</h2>
          <p>We received a request to reset your password. Click the button below:</p>
          <a href="${resetLink}" style="background-color:#DD1215;color:white;padding:12px 20px;
            text-decoration:none;border-radius:5px;display:inline-block;margin:20px 0;">
            Reset Password
          </a>
          <p>If the button doesn't work, copy this link:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link expires in 10 minutes.</p>
          <hr/>
          <p style="color:#888; font-size:12px;">If you did not request this, ignore this email.</p>
          <p style="color:#ccc; font-size:12px;">© ${new Date().getFullYear()} Infinito Comics</p>
        </div>
      `,
    });
    console.log('✅ Forgot password email sent to:', toEmail);
  } catch (error) {
    console.error('❌ Error sending forgot password email:', error.message);
  }
};
