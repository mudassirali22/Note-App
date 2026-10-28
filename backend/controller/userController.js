import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { validateLogin, validateSignup } from "../lib/utils.js";
import { Session } from "../model/sessionModel.js";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, randomInt } from "node:crypto";
import validator from "validator";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_DELAY_MS = 60 * 1000;
const MAX_SIGNUP_OTP_ATTEMPTS = 5;
const MAX_RESET_OTP_ATTEMPTS = 5;

const sendSignupOtp = async (user) => {
    const otp = randomInt(100000, 1000000).toString();

    user.signupOtpHash = await bcrypt.hash(otp, 10);
    user.signupOtpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);
    user.signupOtpAttempts = 0;
    user.signupOtpLastSentAt = new Date();

    await user.save();
    await sendOtpMail(user.email, otp, "signup");
};

const createLoginTokens = async (user) => {
    await Session.deleteMany({ userId: user._id });
    await Session.create({ userId: user._id });

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "10d" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "30d" });

    user.isLoggedIn = true;
    await user.save();

    return { accessToken, refreshToken };
};


// Signup User 
const registerUser = async (req, res)=>{
try {

    validateSignup(req)
    
    const { userName, password } = req.body;
    const email = req.body.email.trim().toLowerCase();
    
    let user = await User.findOne({ email });

        if (user?.isverified) {
            throw new Error("User already exists with this email");
        }

        if (!user) {
            const hashpassword = await bcrypt.hash(password, 10);
            user = await User.create({
                userName,
                email,
                password: hashpassword,
            });
        } else if (
            user.signupOtpLastSentAt &&
            Date.now() - user.signupOtpLastSentAt.getTime() < OTP_RESEND_DELAY_MS
        ) {
            return res.status(429).json({
                success: false,
                message: "A verification code was sent recently. Please check your inbox or wait a minute before requesting another.",
            });
        }

        await sendSignupOtp(user);

        return res.status(202).json({
            success: true,
            message: "A 6-digit verification code has been sent to your email.",
            email,
        });

} catch (error) {
    console.log("User Register Error :", error);

    const validationErrors = [
      "Name is required",
      "Invalid Email Address!",
      "Password is not strong enough",
      "User already exists with this email",
    ];

    const statusCode = validationErrors.some((msg) => error.message.includes(msg)) ? 400 : 500;

    res.status(statusCode).json({
        message: error.message,
        error: error.message,
    });
    
}
}

const verifySignupOtp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const otp = String(req.body.otp || "");

        if (!email || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Enter the email address and complete 6-digit code.",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }
        if (user.isverified) {
            return res.status(400).json({ success: false, message: "This account is already verified. Please sign in." });
        }
        if (!user.signupOtpHash || !user.signupOtpExpiry) {
            return res.status(400).json({ success: false, message: "No active code found. Please request a new one." });
        }
        if (user.signupOtpExpiry < new Date()) {
            user.signupOtpHash = null;
            user.signupOtpExpiry = null;
            user.signupOtpAttempts = 0;
            await user.save();
            return res.status(400).json({ success: false, message: "Your code has expired. Please request a new one." });
        }
        if (user.signupOtpAttempts >= MAX_SIGNUP_OTP_ATTEMPTS) {
            return res.status(429).json({ success: false, message: "Too many incorrect attempts. Request a new code to continue." });
        }

        const isOtpValid = await bcrypt.compare(otp, user.signupOtpHash);
        if (!isOtpValid) {
            user.signupOtpAttempts += 1;
            if (user.signupOtpAttempts >= MAX_SIGNUP_OTP_ATTEMPTS) {
                user.signupOtpHash = null;
                user.signupOtpExpiry = null;
                user.signupOtpAttempts = 0;
            }
            await user.save();
            return res.status(400).json({
                success: false,
                message: user.signupOtpHash
                    ? "That code is incorrect. Please try again."
                    : "Too many incorrect attempts. Request a new code to continue.",
            });
        }

        user.isverified = true;
        user.signupOtpHash = null;
        user.signupOtpExpiry = null;
        user.signupOtpAttempts = 0;
        await user.save();

        const { accessToken, refreshToken } = await createLoginTokens(user);
        return res.status(200).json({
            success: true,
            message: "Email verified. You are now signed in.",
            accessToken,
            refreshToken,
            user: { id: user._id, userName: user.userName, email: user.email },
        });
    } catch (error) {
        console.error("Signup OTP verification error:", error);
        return res.status(500).json({ success: false, message: "Could not verify your code. Please try again." });
    }
};

const resendSignupOtp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ success: false, message: "Email address is required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }
        if (user.isverified) {
            return res.status(400).json({ success: false, message: "This account is already verified. Please sign in." });
        }
        if (
            user.signupOtpLastSentAt &&
            Date.now() - user.signupOtpLastSentAt.getTime() < OTP_RESEND_DELAY_MS
        ) {
            return res.status(429).json({
                success: false,
                message: "Please wait a minute before requesting another code.",
            });
        }

        await sendSignupOtp(user);
        return res.status(200).json({ success: true, message: "A new verification code has been sent." });
    } catch (error) {
        console.error("Signup OTP resend error:", error);
        return res.status(500).json({ success: false, message: "Could not send a new code. Please try again." });
    }
};


// verify User 
const verification = async (req, res)=>{
   try {
    const token = decodeURIComponent(req.params.token);
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                success: false,
                message: "The registration token is expired"
            })
        }
        return res.status(400).json({
            success: false,
            message: "Token Verification Fail"
        });

    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    user.token = null ;

    user.isverified = true
    await user.save();
        res.redirect(`${process.env.FRONTEND_URL}/login`)

   } catch (error) {
    return res.status(500).json({
        success: false,
        message: error.message
    })
   }
}


// Login User 
const loginUser = async (req, res) => {
      try {
        
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        validateLogin(req);

         const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access"
            })
        }


        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {      
            return res.status(402).json({
                success: false,
                message: "Incorrect Password"
            });
        }

        if (user.isverified !== true) {
            const canResendOtp =
                !user.signupOtpLastSentAt ||
                Date.now() - user.signupOtpLastSentAt.getTime() >= OTP_RESEND_DELAY_MS;
            if (canResendOtp) {
                await sendSignupOtp(user);
            }
            return res.status(403).json({
                success: false,
                code: "EMAIL_VERIFICATION_REQUIRED",
                message: "Verify your email with the 6-digit code to finish signing in.",
            })
        }

        const { accessToken, refreshToken } = await createLoginTokens(user);

        return res.status(200).json({
            success: true,
            message: `Welcome Back ${user.userName}`,
            accessToken,
            refreshToken,
            user
        })
         
      } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })       
      }
}


// Logout User 
const logoutUser = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(userId);
        
        
        await Session.deleteMany({userId});
        await User.findByIdAndUpdate(userId, {isLoggedIn: false})
       
             return res.status(200).json({
            success: true,
            message: "Logout successfully"
        }) 

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        }) 
    }
}


// Forget Password
const forgetPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
            success: false,
            message: "User not found"
        }); 
        }

        if (!user.isverified) {
            return res.status(403).json({ success: false, message: "Verify your email before resetting your password." });
        }

        if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < OTP_RESEND_DELAY_MS) {
            return res.status(429).json({
                success: false,
                message: "Please wait a minute before requesting another code.",
            });
        }

        const otp = randomInt(100000, 1000000).toString();
        const expiry = new Date(Date.now() + OTP_EXPIRY_MS);
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiry = expiry;
        user.otpAttempts = 0;
        user.otpLastSentAt = new Date();
        user.passwordResetNonce = null;

        await user.save();
        await sendOtpMail(email, otp, "password-reset");

            return res.status(200).json({
            success: true,
            message: "Otp Send Successfully"
        }) 

        
    } catch (error) {
             return res.status(500).json({
            success: false,
            message: error.message
        }) 
    }
} 


// Verfiy OTP 
const verifyOtp = async (req, res) => {
    const {otp} = req.body;
    const email = req.params.email.trim().toLowerCase();

    if (!/^\d{6}$/.test(String(otp || ""))) {
         return res.status(400).json({
            success: false,
            message: "Otp is required"
        }) 
    }

    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
            success: false,
            message: "user not found"
        }) 
        }
        if (!user.otp || !user.otpExpiry) {
             return res.status(400).json({
            success: false,
            message: "OTP not generated or already verfied"
        }) 
        }
        if (user.otpExpiry < new Date()) {
           user.otp = null;
           user.otpExpiry = null;
           user.otpAttempts = 0;
           await user.save();
           return res.status(400).json({
            success: false,
            message: "OTP has expired. Please request a new one"
        }) 
        }
        if (user.otpAttempts >= MAX_RESET_OTP_ATTEMPTS) {
        return res.status(429).json({
            success: false,
            message: "Too many incorrect attempts. Request a new code to continue.",
        });
        }
        if (!await bcrypt.compare(String(otp), user.otp)) {
        user.otpAttempts += 1;
        if (user.otpAttempts >= MAX_RESET_OTP_ATTEMPTS) {
            user.otp = null;
            user.otpExpiry = null;
            user.otpAttempts = 0;
        }
        await user.save();
        return res.status(400).json({
        success: false,
        message: user.otp ? "That code is incorrect. Please try again." : "Too many incorrect attempts. Request a new code to continue.",
        }) 
        }
        
        user.otp = null;
        user.otpExpiry = null;
        user.otpAttempts = 0;
        user.passwordResetNonce = randomBytes(32).toString("hex");

        await user.save();
        const resetToken = jwt.sign(
        { id: user._id, purpose: "password-reset", nonce: user.passwordResetNonce },
        process.env.SECRET_KEY,
        { expiresIn: "10m" }
        );

        return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        resetToken,
        }) 

        
    } catch (error) {
         return res.status(500).json({
            success: false,
            message: "Internal server error"
        }) 
    }
}


// Change Password 
const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, resetToken } = req.body;
        const email = req.params.email.trim().toLowerCase();

        if (!newPassword || !confirmPassword || !resetToken) {
            return res.status(400).json({
                success: false,
                message: "All fields and a verified reset session are required.",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must include at least 8 characters, uppercase and lowercase letters, a number, and a symbol.",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.SECRET_KEY);
        } catch {
            return res.status(401).json({ success: false, message: "Your password reset session has expired. Request a new code." });
        }
        if (decoded.purpose !== "password-reset" || !decoded.nonce) {
            return res.status(401).json({ success: false, message: "Invalid password reset session." });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.email !== email || user.passwordResetNonce !== decoded.nonce) {
            return res.status(404).json({
                success: false,
                message: "Your password reset session is invalid or has already been used.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordResetNonce = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Could not update your password. Please try again.",
        });
    }
};


// Dashboard 
const dashboard = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
      message: "Dashboard data fetched successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export { registerUser, verifySignupOtp, resendSignupOtp, verification, loginUser, logoutUser, forgetPassword, verifyOtp, changePassword, dashboard };