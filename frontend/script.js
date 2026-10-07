const validateButton =
    document.getElementById("validateButton");

const documentFileInput =
    document.getElementById("documentFile");

const htmlFileInput =
    document.getElementById("htmlFile");

const result =
    document.getElementById("result");

const doneButton =
    document.getElementById("doneButton");


validateButton.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();

        const documentFile =
            documentFileInput.files[0];

        const htmlFile =
            htmlFileInput.files[0];


        if (!documentFile) {

            result.innerHTML = `
                <p style="color:red;">
                    Please select a PDF or DOCX file.
                </p>
            `;

            return;
        }


        if (!htmlFile) {

            result.innerHTML = `
                <p style="color:red;">
                    Please select an HTML file.
                </p>
            `;

            return;
        }


        const formData =
            new FormData();

        formData.append(
            "document",
            documentFile
        );

        formData.append(
            "html",
            htmlFile
        );


        result.innerHTML = `
            <p>
                Validating files...
            </p>
        `;


        doneButton.style.display = "none";


        try {

            const response =
                await fetch(
                    "http://localhost:5050/api/validation/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Validation failed."
                );
            }


            const validation =
                data.result;


            /*
                SHOW DONE BUTTON
            */
            doneButton.style.display =
                "inline-block";


            if (
                validation.status ===
                "MATCH"
            ) {

                result.innerHTML = `
                    <div style="color:green;">
                        <h3>
                            ✅ Validation Successful
                        </h3>

                        <p>
                            Document and HTML
                            contents are identical.
                        </p>
                    </div>
                `;

            } else {

                let differenceHTML = "";


                validation.differences.forEach(
                    (diff) => {

                        differenceHTML += `
                            <div style="
                                margin-top:15px;
                                padding:10px;
                                border:1px solid #ccc;
                            ">

                                <strong>
                                    Line ${diff.lineNumber}
                                </strong>

                                <p>
                                    <strong>
                                        Document:
                                    </strong>

                                    ${
                                        diff.document ||
                                        "(missing)"
                                    }
                                </p>

                                <p>
                                    <strong>
                                        HTML:
                                    </strong>

                                    ${
                                        diff.html ||
                                        "(missing)"
                                    }
                                </p>

                            </div>
                        `;
                    }
                );


                result.innerHTML = `
                    <div style="color:red;">

                        <h3>
                            ❌ Content Mismatch
                        </h3>

                        <p>
                            ${validation.message}
                        </p>

                        ${differenceHTML}

                    </div>
                `;
            }


        } catch (error) {

            console.error(
                "Validation error:",
                error
            );


            result.innerHTML = `
                <p style="color:red;">
                    ❌ ${error.message}
                </p>
            `;
        }
    }
);


/*
    DONE BUTTON
*/
doneButton.addEventListener(
    "click",
    async () => {

        try {

            doneButton.disabled = true;

            doneButton.textContent =
                "Cleaning up...";


            const response =
                await fetch(
                    "http://localhost:5050/api/validation/done",
                    {
                        method: "POST"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete files."
                );
            }


            result.innerHTML = `
                <div style="color:green;">

                    <h3>
                        ✅ Done
                    </h3>

                    <p>
                        Uploaded files have been
                        deleted successfully.
                    </p>

                </div>
            `;


            doneButton.style.display =
                "none";


            documentFileInput.value = "";
            htmlFileInput.value = "";


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            result.innerHTML = `
                <p style="color:red;">
                    ❌ ${error.message}
                </p>
            `;


            doneButton.disabled =
                false;

            doneButton.textContent =
                "Done";
        }
    }
);