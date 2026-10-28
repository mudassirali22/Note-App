import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendOtpMail = async (email, otp, purpose = "password-reset") => {
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
            subject: purpose === "signup" ? "Your NoteSpace verification code" : "Your password reset code",
            html: purpose === "signup"
                ? `<p>Use <b>${otp}</b> to verify your NoteSpace account. This code expires in 10 minutes.</p>`
                : `<p>Use <b>${otp}</b> to reset your password. This code expires in 10 minutes.</p>`
    }
      
    await transporter.sendMail(mailOption)
}