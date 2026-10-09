require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "StudyRoom AI Backend is running"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StudyRoom AI API is healthy",
        time: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log("--------------------------------");
        console.log("StudyRoom AI Backend");
        console.log(`Server running on port ${PORT}`);
        console.log("--------------------------------");
    });
}

startServer();