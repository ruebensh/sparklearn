import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email: string, name: string, otp: string) => {
  console.log(`\n📧 OTP CODE for ${email}: ${otp}\n`);
  await resend.emails.send({
    from: 'Crisis Classroom <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email — Crisis Classroom',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0A1628; color: white; border-radius: 16px;">
        <h1 style="color: #F5A623; font-size: 28px; margin-bottom: 8px;">Crisis Classroom</h1>
        <p style="color: #8892B0; margin-bottom: 32px;">Email Verification</p>
        <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
        <p style="color: #8892B0;">Your verification code:</p>
        <div style="background: #112240; border: 2px solid #F5A623; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #F5A623;">${otp}</span>
        </div>
        <p style="color: #8892B0; font-size: 14px;">This code expires in <strong style="color: white;">10 minutes</strong>.</p>
        <p style="color: #8892B0; font-size: 12px; margin-top: 32px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};
