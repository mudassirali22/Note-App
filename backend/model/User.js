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
    
  },
  {
    timestamps: true,
  });

  const User = mongoose.model('User', userSchema);

export default User;