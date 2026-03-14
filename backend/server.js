import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dataBase.js";
import userRoute from "./routes/userRoute.js";
import cors from "cors";


dotenv.config();
const app = express();
const port = process.env.PORT || 3000

const allowedOrigin = process.env.CLIENT_URL;

app.use(cors({
  origin: "https://note-app-07sv.onrender.com/",
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