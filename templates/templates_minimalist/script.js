
// =====================================
// HELPER
// =====================================

function $(id) {
    return document.getElementById(id);
}

function getValue(id) {
    return $(id)?.value.trim() || "";
}

function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = value || "";
    }
}

function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function splitBlocks(value) {
    return value
        .split(/\n\s*\n/)
        .map(item => item.trim())
        .filter(Boolean);
}

// =====================================
// INFORMASI PRIBADI
// =====================================

function updatePersonalInfo() {
    setText(
        "previewName",
        getValue("nameInput").toUpperCase()
    );

    setText("previewJob", getValue("jobInput"));
    setText("previewEmail", getValue("emailInput"));
    setText("previewPhone", getValue("phoneInput"));
    setText("previewAddress", getValue("addressInput"));
    setText("previewSummary", getValue("summaryInput"));
}

// =====================================
// PENGALAMAN KERJA
// Format:
// Jabatan|Perusahaan|Tanggal|Deskripsi 1|Deskripsi 2
// =====================================

function updateExperience() {
    const preview = $("previewExperience");

    if (!preview) return;

    const experiences = splitBlocks(getValue("experienceInput"));

    preview.innerHTML = experiences.map(item => {
        const parts = item.split("|").map(part => part.trim());

        const position = escapeHTML(parts[0] || "");
        const company = escapeHTML(parts[1] || "");
        const date = escapeHTML(parts[2] || "");
        const descriptions = parts.slice(3);

        const descriptionHTML = descriptions
            .filter(Boolean)
            .map(description => `<li>${escapeHTML(description)}</li>`)
            .join("");

        return `
            <div class="experience-item">
                <div class="experience-heading">
                    <h3>${position}</h3>
                    <span class="date">${date}</span>
                </div>

                <p class="experience-company">${company}</p>

                <ul>
                    ${descriptionHTML}
                </ul>
            </div>
        `;
    }).join("");
}

// =====================================
// PENDIDIKAN
// Format:
// Gelar|Institusi|Keterangan|Tahun
// =====================================

function updateEducation() {
    const preview = $("previewEducation");

    if (!preview) return;

    const education = splitBlocks(getValue("educationInput"));

    preview.innerHTML = education.map(item => {
        const parts = item.split("|").map(part => part.trim());

        const degree = escapeHTML(parts[0] || "");
        const institution = escapeHTML(parts[1] || "");
        const description = escapeHTML(parts[2] || "");
        const date = escapeHTML(parts[3] || "");

        return `
            <div class="education-item">
                <h3>${degree}</h3>

                <p class="institution">${institution}</p>

                ${description ? `
                    <ul>
                        <li>${description}</li>
                    </ul>
                ` : ""}

                <p class="date">${date}</p>
            </div>
        `;
    }).join("");
}

// =====================================
// SKILLS
// =====================================

function updateSkills() {
    const preview = $("previewSkills");

    if (!preview) return;

    const skills = getValue("skillsInput")
        .split("\n")
        .map(item => item.trim())
        .filter(Boolean);

    const middle = Math.ceil(skills.length / 2);

    const firstColumn = skills.slice(0, middle);
    const secondColumn = skills.slice(middle);

    function createList(items) {
        return `
            <ul class="skills-column">
                ${items.map(item => `
                    <li>${escapeHTML(item)}</li>
                `).join("")}
            </ul>
        `;
    }

    preview.innerHTML =
        createList(firstColumn) +
        createList(secondColumn);
}

// =====================================
// UPDATE SEMUA CV
// =====================================

function updateCV() {
    updatePersonalInfo();
    updateExperience();
    updateEducation();
    updateSkills();
}

// =====================================
// DOWNLOAD PDF
// =====================================


async function downloadPDF() {
    const button = $("downloadButton");
    const cvElement = document.querySelector(".cv-container");

    if (!cvElement) {
        alert("Elemen CV tidak ditemukan.");
        return;
    }

    if (typeof html2pdf === "undefined") {
        alert("Library html2pdf.js belum dimuat.");
        return;
    }

    const originalText = button?.textContent || "Download PDF";

    try {
        if (button) {
            button.disabled = true;
            button.textContent = "Membuat PDF...";
        }

        updateCV();

        await new Promise(resolve => {
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            });
        });

        const name = getValue("nameInput")
            .replace(/[^a-zA-Z0-9_-]/g, "_");

        await html2pdf()
            .set({
                filename: `CV_${name || "Pengguna"}.pdf`,

                // Margin nol agar ruang halaman tidak bertambah
                margin: 0,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    scrollX: 0,
                    scrollY: 0
                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait",
                    compress: true
                },

                // Hindari pemisahan halaman otomatis dari mode legacy
                pagebreak: {
                    mode: ["css"]
                }
            })
            .from(cvElement)
            .toPdf()
            .get("pdf")
            .then(pdf => {
                // Hapus halaman tambahan yang benar-benar kosong
                for (let i = pdf.getNumberOfPages(); i > 1; i--) {
                    const pageContent = pdf.internal.pages[i];

                    if (
                        pageContent &&
                        pageContent.join("").trim() === ""
                    ) {
                        pdf.deletePage(i);
                    }
                }
            })
            .save();

    } catch (error) {
        console.error("PDF Error:", error);
        alert("Gagal membuat PDF. Periksa Console browser.");

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}


// =====================================
// EVENT LISTENER
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    // Live preview
    const cvForm = $("cvForm");

    if (cvForm) {
        cvForm.addEventListener("input", updateCV);
    }

    // Download PDF
    const downloadButton = $("downloadButton");

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadPDF);
    }

    // Tampilkan data awal
    updateCV();
});
