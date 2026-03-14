import express from "express";
import { changePassword, dashboard, forgetPassword, loginUser, logoutUser, registerUser, verification, verifyOtp,  } from "../controller/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { allnotes, createNote, deleteNote, updateNote } from "../controller/noteController.js";


const router = express.Router();

router.post('/signup', registerUser);

router.get('/verify/:token', verification);

router.post('/login', loginUser);

router.post('/logout',isAuthenticated, logoutUser);

router.post('/forget-password', forgetPassword);

router.post('/verify-otp/:email', verifyOtp);

router.post('/change-password/:email', changePassword);

router.get('/dashboard', isAuthenticated, dashboard);

router.post('/addnote', isAuthenticated, createNote)

router.get('/allnotes', isAuthenticated, allnotes)

router.put('/update/:id', isAuthenticated, updateNote)

router.delete('/delete/:id', isAuthenticated, deleteNote)



export default router   