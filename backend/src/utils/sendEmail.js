import { Resend } from 'resend';
import config from '../config/server-config.js';

// Initialize Resend only if API key is available
const resend = config.RESEND_API_KEY ? new Resend(config.RESEND_API_KEY) : null;

// Use onboarding@resend.dev as safe default — works without domain verification
// Switch to no-reply@infinitohq.com once infinitohq.com is verified in Resend dashboard
const FROM_ADDRESS = 'Infinito Comics <onboarding@resend.dev>';

export const sendEmail = async (to, subject, text) => {
  if (!config.RESEND_API_KEY || !resend) {
    console.warn('⚠️  RESEND_API_KEY not set - skipping email to:', to);
    return;
  }
  try {
    // Convert plain text to clean HTML
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;border:1px solid #eee;border-radius:8px;">
        <div style="background:#DD1215;padding:16px 20px;border-radius:6px 6px 0 0;margin-bottom:20px;">
          <h2 style="color:#fff;margin:0;font-size:18px;">InfinitoComics</h2>
        </div>
        ${text.split('\n').map(line =>
          line.trim() === ''
            ? '<br/>'
            : `<p style="margin:0 0 10px;text-align:left;font-size:14px;line-height:1.6;">${line}</p>`
        ).join('')}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="color:#aaa;font-size:11px;text-align:center;">© ${new Date().getFullYear()} InfinitoComics India · <a href="https://infinitohq.com" style="color:#DD1215;text-decoration:none;">infinitohq.com</a></p>
      </div>
    `;
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    });
    console.log('✅ Email sent to:', to, '| ID:', result?.data?.id || result?.id || 'N/A');
    return result;
  } catch (error) {
    console.error('❌ Error sending email to', to, ':', error.message);
    // Non-fatal — log and continue, never crash the main operation
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
