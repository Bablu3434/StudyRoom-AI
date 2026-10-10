require("dotenv").config();

const quizRoutes = require("./routes/quizRoutes");
const focusRoutes = require("./routes/focusRoutes");
const noteRoutes = require("./routes/noteRoutes");
const taskRoutes = require("./routes/taskRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/tasks" , taskRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/quiz", quizRoutes);

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