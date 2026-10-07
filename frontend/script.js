const validateButton = document.getElementById("validateButton");
const documentFileInput = document.getElementById("documentFile");
const htmlFileInput = document.getElementById("htmlFile");
const result = document.getElementById("result");
const doneButton = document.getElementById("doneButton");

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function resetDoneButton() {
    doneButton.disabled = false;
    doneButton.textContent = "Done";
}

validateButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const documentFile = documentFileInput.files[0];
    const htmlFile = htmlFileInput.files[0];

    if (!documentFile) {
        result.innerHTML = `<p style="color:red;">Please select a PDF or DOCX file.</p>`;
        return;
    }

    if (!htmlFile) {
        result.innerHTML = `<p style="color:red;">Please select an HTML file.</p>`;
        return;
    }

    const formData = new FormData();
    formData.append("document", documentFile);
    formData.append("html", htmlFile);

    result.innerHTML = `<p>Validating files...</p>`;

    doneButton.style.display = "none";
    resetDoneButton();

    try {
        const response = await fetch("/api/validation/upload", {
            method: "POST",
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error("Server returned an invalid response.");
        }

        if (!response.ok) {
            throw new Error(data.message || "Validation failed.");
        }

        const validation = data.result;

        doneButton.style.display = "inline-block";

        if (validation.status === "MATCH") {
            result.innerHTML = `
                <div style="color:green;">
                    <h3>✅ Validation Successful</h3>
                    <p>Document and HTML contents are identical.</p>
                </div>
            `;
        } else {
            let differenceHTML = "";

            validation.differences.forEach((diff) => {
                differenceHTML += `
                    <div style="margin-top:15px; padding:10px; border:1px solid #ccc;">
                        <strong>Line ${diff.lineNumber}</strong>
                        <p><strong>Document:</strong> ${escapeHtml(diff.document || "(missing)")}</p>
                        <p><strong>HTML:</strong> ${escapeHtml(diff.html || "(missing)")}</p>
                    </div>
                `;
            });

            result.innerHTML = `
                <div style="color:red;">
                    <h3>❌ Content Mismatch</h3>
                    <p>${escapeHtml(validation.message)}</p>
                    ${differenceHTML}
                </div>
            `;
        }
    } catch (error) {
        console.error("Validation error:", error);

        result.innerHTML = `<p style="color:red;">❌ ${escapeHtml(error.message)}</p>`;
    }
});

/*
    DONE BUTTON
*/
doneButton.addEventListener("click", async () => {
    try {
        doneButton.disabled = true;
        doneButton.textContent = "Cleaning up...";

        const response = await fetch("/api/validation/done", {
            method: "POST"
        });

        let data = {};
        try {
            data = await response.json();
        } catch {
            // ignore parse errors; handled by response.ok below
        }

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete files.");
        }

        result.innerHTML = `
            <div style="color:green;">
                <h3>✅ Done</h3>
                <p>Uploaded files have been deleted successfully.</p>
            </div>
        `;

        doneButton.style.display = "none";
        resetDoneButton(); // <-- this was missing, causing the stuck "Cleaning up..." button

        documentFileInput.value = "";
        htmlFileInput.value = "";
    } catch (error) {
        console.error("Delete error:", error);

        result.innerHTML = `<p style="color:red;">❌ ${escapeHtml(error.message)}</p>`;

        resetDoneButton();
    }
});