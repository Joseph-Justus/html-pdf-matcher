const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

async function parseDocument(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    if (extension === ".pdf") {
        return await parsePDF(filePath);
    }

    if (extension === ".docx") {
        return await parseDOCX(filePath);
    }

    throw new Error(
        "Unsupported document type. Only PDF and DOCX are allowed."
    );
}

async function parsePDF(filePath) {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
        data: buffer
    });

    try {
        const result = await parser.getText();

        return cleanText(result.text);
    } finally {
        await parser.destroy();
    }
}

async function parseDOCX(filePath) {
    const result = await mammoth.extractRawText({
        path: filePath
    });

    return cleanText(result.value);
}

function cleanText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map(line => line.replace(/\s+/g, " ").trim())

        // Remove PDF page-number markers such as:
        // -- 1 of 1 --
        // -- 2 of 5 --
        // -- 10 of 10 --
        .filter(line => !/^--\s*\d+\s+of\s+\d+\s*--$/i.test(line))

        // Remove empty lines
        .filter(line => line.length > 0);
}

module.exports = {
    parseDocument
};