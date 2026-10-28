import mongoose from "mongoose";
import validator from "validator";


const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required : true,
      minLength: 3,
      maxLength: 50,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,

      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address");
        }
      },
    },

    password: {
      type: String,
      required: true,

      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },

    isverified:{
      type: Boolean,
      default: false
    },

    isLoggedIn: {
       type: Boolean,
      default: false
    },

    token: {
       type: String,
      default: null
    },

    otp: {
       type: String,
      default: null
    },
    
      otpExpiry: {
       type: Date,
      default: null
    },

      otpAttempts: {
        type: Number,
        default: 0,
      },

      otpLastSentAt: {
        type: Date,
        default: null,
      },

      passwordResetNonce: {
        type: String,
        default: null,
      },

      signupOtpHash: {
        type: String,
        default: null,
      },

      signupOtpExpiry: {
        type: Date,
        default: null,
      },

      signupOtpAttempts: {
        type: Number,
        default: 0,
      },

      signupOtpLastSentAt: {
        type: Date,
        default: null,
      },
    
  },
  {
    timestamps: true,
  });

  const User = mongoose.model('User', userSchema);

export default User;