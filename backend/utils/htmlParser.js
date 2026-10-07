const fs = require("fs");
const cheerio = require("cheerio");

async function parseHTML(filePath) {

    const html = fs.readFileSync(filePath, "utf8");

    const $ = cheerio.load(html);

    // Remove elements that are not visible content
    $("script, style, noscript, template").remove();

    // Create line breaks for common block elements
    $("br").replaceWith("\n");

    $(
        "p, h1, h2, h3, h4, h5, h6, " +
        "li, tr, div, section, article, header, footer, " +
        "blockquote, pre"
    ).each(function () {
        $(this).append("\n");
    });

    const text = $("body").text();

    return cleanText(text);
}


function cleanText(text) {

    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map(line => line.replace(/\s+/g, " ").trim())
        .filter(line => line.length > 0);
}


module.exports = {
    parseHTML
};