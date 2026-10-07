const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

async function parseDocument(buffer, originalName) {
    const extension = path.extname(originalName || "").toLowerCase();

    if (extension === ".pdf") {
        return await parsePDF(buffer);
    }

    if (extension === ".docx") {
        return await parseDOCX(buffer);
    }

    throw new Error(
        "Unsupported document type. Only PDF and DOCX are allowed."
    );
}

async function parsePDF(buffer) {
    const parser = new PDFParse({
        data: new Uint8Array(buffer)
    });

    try {
        const result = await parser.getText();

        return cleanText(result.text);
    } finally {
        await parser.destroy();
    }
}

async function parseDOCX(buffer) {
    const result = await mammoth.extractRawText({ buffer });

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