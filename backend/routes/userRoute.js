import express from "express";
import { changePassword, dashboard, forgetPassword, loginUser, logoutUser, registerUser, resendSignupOtp, verification, verifyOtp, verifySignupOtp } from "../controller/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { allnotes, createNote, deleteNote, emptyTrash, permanentlyDeleteNote, restoreNote, updateNote } from "../controller/noteController.js";


const router = express.Router();

router.post('/signup', registerUser);

router.post('/verify-signup-otp', verifySignupOtp);

router.post('/resend-signup-otp', resendSignupOtp);

router.get('/verify/:token', verification);

router.post('/login', loginUser);

router.post('/logout',isAuthenticated, logoutUser);

router.post('/forget-password', forgetPassword);

router.post('/verify-otp/:email', verifyOtp);

router.post('/change-password/:email', changePassword);

router.get('/dashboard', isAuthenticated, dashboard);

router.delete('/empty-trash', isAuthenticated, emptyTrash);

router.post('/addnote', isAuthenticated, createNote)

router.get('/allnotes', isAuthenticated, allnotes)

router.put('/update/:id', isAuthenticated, updateNote)

router.post('/restore/:id', isAuthenticated, restoreNote)

router.delete('/delete-permanently/:id', isAuthenticated, permanentlyDeleteNote)

router.delete('/delete/:id', isAuthenticated, deleteNote)



export default router   