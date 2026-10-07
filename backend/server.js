const express = require("express");
const cors = require("cors");

const validationRoutes = require("../netlify/functions/validation");

const app = express();

const PORT = 5050;

app.use(cors());
app.use(express.json());

app.use("/api/validation", validationRoutes);

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Document HTML Validator Backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});