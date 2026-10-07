const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { parseDocument } = require("../../backend/utils/documentParser");
const { parseHTML } = require("../../backend/utils/htmlParser");
const { compareLines } = require("../../backend/utils/comparator");

const router = express.Router();

const uploadFolder = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1E9);

        cb(null, uniqueName + extension);
    }
});

const upload = multer({
    storage: storage
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

            if (!req.files ||
                !req.files.document ||
                !req.files.html) {

                return res.status(400).json({
                    message: "Please upload both a document and an HTML file."
                });
            }

            const documentFile = req.files.document[0];
            const htmlFile = req.files.html[0];

            console.log("Document:", documentFile.originalname);
            console.log("HTML:", htmlFile.originalname);

            const documentLines =
                await parseDocument(documentFile.path);

            const htmlLines =
                await parseHTML(htmlFile.path);

            const comparison =
                compareLines(documentLines, htmlLines);

            console.log("Comparison result:", comparison);

            res.json({
                message: "Validation completed.",
                result: comparison
            });

        } catch (error) {

            console.error("Validation error:", error);

            res.status(500).json({
                message:
                    error.message || "Validation failed."
            });
        }
    }
);


/*
    DELETE UPLOADED FILES
*/
router.post("/done", async (req, res) => {

    try {

        const files = fs.readdirSync(uploadFolder);

        for (const file of files) {

            const filePath =
                path.join(uploadFolder, file);

            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
            }
        }

        console.log("Uploaded files deleted.");

        res.json({
            message: "Uploaded files deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete files error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to delete uploaded files."
        });
    }
});


module.exports = router;