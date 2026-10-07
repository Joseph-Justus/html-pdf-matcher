const { parseDocument } = require("./utils/documentParser");

async function test() {

    try {

        const filePath = process.argv[2];

        if (!filePath) {
            console.log("Please provide a PDF or DOCX file.");
            console.log(
                "Example: node testDocumentParser.js uploads/sample.pdf"
            );
            return;
        }

        const lines = await parseDocument(filePath);

        console.log("\nDocument parsed successfully!\n");

        console.log("Total lines:", lines.length);

        console.log("\nDocument lines:");

        lines.forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });

    } catch (error) {

        console.error("\nError parsing document:");
        console.error(error.message);

    }
}

test();