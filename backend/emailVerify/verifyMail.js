import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const verifyMail = async (token, email) => {
    const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, "template.hbs"),
        "utf-8"
    );

    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const verifyUrl = `${backendUrl}/user/verify/${encodeURIComponent(token)}`;

    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({ verifyUrl });

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailConfiguration = {
            from: process.env.MAIL_ADDRESS,
            to: email,
            subject: "Email Verification",
            html: htmlToSend,
        };

        const info = await transporter.sendMail(mailConfiguration);

        console.log("Email Sent Successfully");
        console.log(info);

        return info;
    } catch (error) {
        console.log("Mail Error:", error.message);
        throw new Error(`Send Mail Error: ${error.message}`);
    }
};