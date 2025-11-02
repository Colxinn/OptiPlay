// Email verification system for new user registrations
import prisma from './prisma';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email via MailerSend
 */
export async function sendVerificationEmail(email, code, username) {
  const mailerSendApiKey = process.env.MAILERSEND_API_TOKEN;
  const authEmailFrom = process.env.AUTH_EMAIL_FROM || 'OptiPlay <noreply@optiplay.gg>';
  
  // Parse AUTH_EMAIL_FROM to extract email and name
  // Format: "Name <email@domain.com>" or just "email@domain.com"
  let fromEmail = authEmailFrom;
  let fromName = 'OptiPlay';
  
  const matches = authEmailFrom.match(/^(.+?)\s*<(.+?)>$/);
  if (matches) {
    fromName = matches[1].trim();
    fromEmail = matches[2].trim();
  }

  if (!mailerSendApiKey) {
    console.error('❌ MAILERSEND_API_TOKEN not set in environment variables');
    // In development, just log the code
    if (process.env.NODE_ENV === 'development') {
      console.log(`
    ====================================
    📧 EMAIL VERIFICATION CODE (DEV MODE)
    ====================================
    To: ${email}
    Username: ${username}
    Code: ${code}
    
    Please verify your email to complete registration.
    This code expires in 15 minutes.
    ====================================
      `);
      return { success: true };
    }
    throw new Error('Email service not configured');
  }

  try {
    const mailerSend = new MailerSend({
      apiKey: mailerSendApiKey,
    });

    const sentFrom = new Sender(fromEmail, fromName);
    const recipients = [new Recipient(email, username)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Verify your OptiPlay account')
      .setHtml(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 40px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
              
              <!-- Logo/Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  OptiPlay
                </h1>
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">Gaming Performance Hub</p>
              </div>

              <!-- Welcome Message -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">Welcome, ${username}! 🎮</h2>
                <p style="margin: 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                  Thanks for joining OptiPlay! To complete your registration, please verify your email address.
                </p>
              </div>

              <!-- Verification Code Box -->
              <div style="background: rgba(168, 85, 247, 0.1); border: 2px solid #a855f7; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Your Verification Code
                </p>
                <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #a855f7; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
                <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 13px;">
                  Expires in 15 minutes
                </p>
              </div>

              <!-- Instructions -->
              <div style="background: rgba(59, 130, 246, 0.05); border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                  <strong style="color: #3b82f6;">How to verify:</strong><br>
                  Enter this code on the verification page to activate your account and start exploring benchmarks, tools, and gaming insights.
                </p>
              </div>

              <!-- Security Notice -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  If you didn't create an OptiPlay account, you can safely ignore this email.
                </p>
                <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 12px;">
                  This is an automated message, please do not reply to this email.
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} OptiPlay. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `)
      .setText(`
Welcome to OptiPlay, ${username}!

Your verification code is: ${code}

This code expires in 15 minutes.

Enter this code on the verification page to complete your registration.

If you didn't create an OptiPlay account, please ignore this email.

---
OptiPlay - Gaming Performance Hub
© ${new Date().getFullYear()} OptiPlay. All rights reserved.
      `);

    await mailerSend.email.send(emailParams);

    console.log(`✅ Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Create a pending user registration
 */
export async function createPendingUser(email, username, passwordHash, ipAddress) {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing pending registration for this email
  await prisma.pendingUser.deleteMany({
    where: { email }
  });

  // Create new pending user
  const pending = await prisma.pendingUser.create({
    data: {
      email,
      username,
      passwordHash,
      verificationCode: code,
      expiresAt,
      ipAddress
    }
  });

  // Send verification email
  await sendVerificationEmail(email, code, username);

  return pending;
}

/**
 * Verify code and create actual user account
 */
export async function verifyAndCreateUser(email, code) {
  // Find pending user
  const pending = await prisma.pendingUser.findUnique({
    where: { email }
  });

  if (!pending) {
    return { success: false, error: 'No pending registration found for this email.' };
  }

  // Check if expired
  if (new Date() > pending.expiresAt) {
    await prisma.pendingUser.delete({ where: { email } });
    return { success: false, error: 'Verification code expired. Please register again.' };
  }

  // Check if code matches
  if (pending.verificationCode !== code) {
    return { success: false, error: 'Invalid verification code.' };
  }

  // Create actual user
  const user = await prisma.user.create({
    data: {
      email: pending.email,
      name: pending.username,
      emailVerified: new Date(),
      passwordHash: pending.passwordHash
    }
  });

  // Delete pending user
  await prisma.pendingUser.delete({ where: { email } });

  return { success: true, user };
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email) {
  const pending = await prisma.pendingUser.findUnique({
    where: { email }
  });

  if (!pending) {
    return { success: false, error: 'No pending registration found.' };
  }

  // Generate new code and extend expiration
  const newCode = generateVerificationCode();
  const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.pendingUser.update({
    where: { email },
    data: {
      verificationCode: newCode,
      expiresAt: newExpiresAt
    }
  });

  await sendVerificationEmail(email, newCode, pending.username);

  return { success: true };
}

/**
 * Clean up expired pending users (run periodically)
 */
export async function cleanupExpiredPendingUsers() {
  const result = await prisma.pendingUser.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return result.count;
}
