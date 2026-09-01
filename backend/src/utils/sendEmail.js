import { Resend } from 'resend';
import config from '../config/server-config.js';

const resend = new Resend(config.RESEND_API_KEY);

export const sendEmail = async (to, subject, text) => {
  if (!config.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set - skipping email to:', to);
    return;
  }
  try {
    await resend.emails.send({
      from: 'Infinito Comics <onboarding@resend.dev>',
      to,
      subject,
      text,
    });
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

export const sendForgotPasswordEmail = async (toEmail, resetLink, userName) => {
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
};
