import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOtpMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOption = {
            from: process.env.MAIL_ADDRESS,
            to: email,
            subject: "Password Reset OTP",
            html: `<p>Your OTP for Password reset is <b>${otp}</b>. It is Valid for 10 minutes.</p>`
    }
      
    await transporter.sendMail(mailOption)
}