const express = require("express");
const multer = require("multer");
const serverless = require("serverless-http");

const { parseDocument } = require("../../backend/utils/documentParser");
const { parseHTML } = require("../../backend/utils/htmlParser");
const { compareLines } = require("../../backend/utils/comparator");

const app = express();
const router = express.Router();

// Keep uploads in memory (Netlify's filesystem is read-only / stateless)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Netlify functions cap request bodies at ~6MB
});

/*
    VALIDATE DOCUMENT + HTML
*/
router.post(
    "/upload",
    upload.fields([
        { name: "document", maxCount: 1 },
        { name: "html", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            if (!req.files || !req.files.document || !req.files.html) {
                return res.status(400).json({
                    message: "Please upload both a document and an HTML file."
                });
            }

            const documentFile = req.files.document[0];
            const htmlFile = req.files.html[0];

            const documentLines = await parseDocument(
                documentFile.buffer,
                documentFile.originalname
            );

            const htmlLines = await parseHTML(htmlFile.buffer);

            const comparison = compareLines(documentLines, htmlLines);

            res.json({
                message: "Validation completed.",
                result: comparison
            });
        } catch (error) {
            console.error("Validation error:", error);

            res.status(500).json({
                message: error.message || "Validation failed."
            });
        }
    }
);

/*
    DONE
    Nothing is stored on the server, so there is nothing to delete.
*/
router.post("/done", (req, res) => {
    res.json({ message: "Uploaded files deleted successfully." });
});

// Mount on every path Netlify might present to the function
app.use("/api/validation", router);
app.use("/.netlify/functions/validation", router);
app.use("/validation", router);
app.use("/", router);

module.exports.handler = serverless(app);