// Email service for sending verification and password reset emails
// This is a placeholder implementation - in production, you would integrate with
// services like SendGrid, AWS SES, or similar

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In development, we'll just log the email content
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.text || options.html}`);
        return true;
      }

      // TODO: Implement actual email sending in production
      // Example with nodemailer or SendGrid:
      /*
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });
      */

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  static async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Selamat datang di MindConnect!</h2>
        <p>Terima kasih telah mendaftar di MindConnect. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verifikasi Email
          </a>
        </div>
        <p>Atau salin dan tempel link berikut di browser Anda:</p>
        <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
        <p style="color: #6B7280; font-size: 14px;">Link ini akan kedaluwarsa dalam 24 jam.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          Jika Anda tidak mendaftar di MindConnect, abaikan email ini.
        </p>
      </div>
    `;

    const text = `
      Selamat datang di MindConnect!
      
      Terima kasih telah mendaftar. Untuk mengaktifkan akun Anda, kunjungi:
      ${verificationUrl}
      
      Link ini akan kedaluwarsa dalam 24 jam.
      
      Jika Anda tidak mendaftar di MindConnect, abaikan email ini.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verifikasi Email MindConnect',
      html,
      text
    });
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset Password MindConnect</h2>
        <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Atau salin dan tempel link berikut di browser Anda:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        <p style="color: #6B7280; font-size: 14px;">Link ini akan kedaluwarsa dalam 1 jam.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 12px;">
          Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
        </p>
      </div>
    `;

    const text = `
      Reset Password MindConnect
      
      Kami menerima permintaan untuk mereset password akun Anda.
      Untuk membuat password baru, kunjungi:
      ${resetUrl}
      
      Link ini akan kedaluwarsa dalam 1 jam.
      
      Jika Anda tidak meminta reset password, abaikan email ini.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Password MindConnect',
      html,
      text
    });
  }
}