import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dataBase.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";


dotenv.config();
const app = express();
const port = process.env.PORT || 3000

// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true
// }))
// 
const allowedOrigin = process.env.CLIENT_URL;

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );



// Vercel 
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use('/user', userRoute);


app.get('/', (req, res)=>{
    res.send("Backend Ready")
})

connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

}).catch((err) => {
    console.log("Database connection failed", err);
});