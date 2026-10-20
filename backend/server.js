require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const noteRoutes = require("./routes/noteRoutes");
const focusRoutes = require("./routes/focusRoutes");
const quizRoutes = require("./routes/quizRoutes");
const progressRoutes = require("./routes/progressRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require("./routes/profileRoutes");


const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(
    cors()
);

app.use(
    express.json()
);


// =====================================
// SERVE UPLOADED FILES
// IMPORTANT FOR NOTE IMAGES
// =====================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// =====================================
// API ROUTES
// =====================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/subjects",
    subjectRoutes
);

app.use(
    "/api/tasks",
    taskRoutes
);

app.use(
    "/api/notes",
    noteRoutes
);

app.use(
    "/api/focus-sessions",
    focusRoutes
);

app.use(
    "/api/quiz",
    quizRoutes
);

app.use(
    "/api/progress",
    progressRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

app.use(
    "/api/profile",
    profileRoutes
);


// =====================================
// ROOT ROUTE
// =====================================

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message:
                "StudyRoom AI Backend is running"
        });

    }
);


// =====================================
// HEALTH CHECK
// =====================================

app.get(
    "/api/health",
    (req, res) => {

        res
            .status(200)
            .json({
                success: true,
                message:
                    "StudyRoom AI API is healthy",
                time:
                    new Date().toISOString()
            });

    }
);


// =====================================
// SERVER START
// =====================================

const PORT =
    process.env.PORT ||
    5000;


async function startServer() {

    try {

        await connectDB();


        app.listen(
            PORT,
            () => {

                console.log(
                    "--------------------------------"
                );

                console.log(
                    "StudyRoom AI Backend"
                );

                console.log(
                    `Server running on port ${PORT}`
                );

                console.log(
                    `Uploads available at http://localhost:${PORT}/uploads`
                );

                console.log(
                    "--------------------------------"
                );

            }
        );

    } catch (error) {

        console.error(
            "Server Start Error:",
            error
        );

        process.exit(1);

    }

}


startServer();