import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import { verifyMail } from "../emailVerify/verifyMail.js";
import { validateLogin, validateSignup } from "../lib/utils.js";
import { Session } from "../model/sessionModel.js";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// Signup User 
const registerUser = async (req, res)=>{
try {

    validateSignup(req)
    
    const { userName, email, password } = req.body;
    
    const user = await User.findOne({ email });

        if (user) {
            throw new Error("User already exists with this email");
        }
      
        const hashpassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        userName,
        email,
        password: hashpassword
      })
      
      const token = jwt.sign({id:newUser._id}, process.env.SECRET_KEY, {expiresIn:"20m"})
      
     await verifyMail(token, email)

      newUser.token = token
  
      await newUser.save();
      
     res.status(201).send({ message: "User created successfully", user: newUser });

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
        res.status(404).json({
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
        
        const { email, password } = req.body;

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
            return res.status(403).json({
                success: false,
                message: "Verify your account than login"
            })
        }
   
        // Check for Existing Session and Deleted 
         const existingSession = await Session.findOne({userId: user._id});
         if (existingSession) {
            await Session.deleteOne({userId: user._id})
         }

        //  Create a new Session 
        await Session.create({ userId: user._id })  
   
        // Generate Token 
        const accessToken = jwt.sign({id: user._id}, process.env.SECRET_KEY, {expiresIn:"10d"});
        const refreshToken =  jwt.sign({id: user._id}, process.env.SECRET_KEY, {expiresIn:"30d"});

        user.isLoggedIn = true;
        await user.save();

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
        const { email } = req.body;
        
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
            success: false,
            message: "User not found"
        }); 
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now()+10*60*1000);

        user.otp = otp;
        user.otpExpiry = expiry;

        await user.save();
        await sendOtpMail(email, otp);

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
    const email = req.params.email;

    if (!otp) {
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
           return res.status(400).json({
            success: false,
            message: "OTP has expired. Please request a new one"
        }) 
        }
        if (otp !== user.otp) {
            return res.status(400).json({
            success: false,
            message: "Invalid OTP"
        }) 
        }
        
        user.otp = null;
        user.expiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
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
        const { newPassword, confirmPassword } = req.body;
        const { email } = req.params.email;

        if (!newPassword || !confirmPassword) {
             return res.status(400).json({
            success: false,
            message: "All feilds are required"
        }) 
        }
        if (newPassword !== confirmPassword) {
             return res.status(400).json({
            success: false,
            message: "Password do not match"
        }) 
        }

        try {
            const user = await User.findOne(email);
            if (!user) {
            return res.status(404).json({
            success: false,
            message: "User not found"
        }) 
            }

         const hashpassword = await bcrypt.hash(newPassword, 10);
         user.password = hashpassword

         await user.save();

          return res.status(200).json({
            success: true,
            message: "Password Change Successfully"
        });

        } catch (error) {
             return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        }) 
        }
        
    } catch (error) {
         return res.status(400).json({
            success: false,
            message: "Otp is required"
        }) 
    }
}


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


export { registerUser, verification, loginUser, logoutUser, forgetPassword, verifyOtp, changePassword,  dashboard};