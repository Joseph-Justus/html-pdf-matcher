function compareLines(documentLines, htmlLines) {

    const maxLines = Math.max(
        documentLines.length,
        htmlLines.length
    );

    const differences = [];

    for (let i = 0; i < maxLines; i++) {

        const documentLine = documentLines[i] || "";
        const htmlLine = htmlLines[i] || "";

        if (documentLine !== htmlLine) {

            differences.push({
                lineNumber: i + 1,
                document: documentLine,
                html: htmlLine
            });
        }
    }

    if (differences.length === 0) {

        return {
            status: "MATCH",
            message: "Document and HTML contents are identical.",
            differences: []
        };

    }

    return {
        status: "MISMATCH",
        message: `${differences.length} difference(s) found.`,
        differences: differences
    };
}


module.exports = {
    compareLines
};