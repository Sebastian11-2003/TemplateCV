
document.addEventListener("DOMContentLoaded", function () {

    // ========================================
    // HELPER
    // ========================================

    const $ = (id) => document.getElementById(id);

    function getValue(id) {
        return $(id)?.value?.trim() || "";
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

    function splitLines(value) {
        return value
            .split("\n")
            .map(item => item.trim())
            .filter(Boolean);
    }

    // ========================================
    // INFORMASI PRIBADI
    // ========================================

    function updatePersonalInfo() {
        setText("previewName", getValue("nameInput"));
        setText("previewJob", getValue("jobInput"));
        setText("previewAbout", getValue("aboutInput"));
        setText("previewPhone", getValue("phoneInput"));
        setText("previewEmail", getValue("emailInput"));
        setText("previewAddress", getValue("addressInput"));
    }

    // ========================================
    // FOTO PROFIL
    // ========================================

    let currentPhotoURL = null;

    function updatePhoto(event) {
        const file = event.target.files?.[0];
        const previewPhoto = $("previewPhoto");

        if (!file || !previewPhoto) return;

        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar!");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran foto maksimal 5 MB!");
            event.target.value = "";
            return;
        }

        if (currentPhotoURL) {
            URL.revokeObjectURL(currentPhotoURL);
        }

        currentPhotoURL = URL.createObjectURL(file);

        previewPhoto.onload = function () {
            previewPhoto.style.width = "100%";
            previewPhoto.style.height = "100%";
            previewPhoto.style.objectFit = "cover";
            previewPhoto.style.objectPosition = "center";
            previewPhoto.style.display = "block";
        };

        previewPhoto.src = currentPhotoURL;
    }

    // ========================================
    // PENDIDIKAN
    // Format: Institusi|Jurusan|Tahun
    // ========================================

    function updateEducation() {
        const items = splitBlocks(getValue("educationInput"));

        const html = items.map(item => {
            const [institution = "", major = "", year = ""] = item.split("|");

            return `
                <div class="cv-item">
                    <h4>${escapeHTML(institution)}</h4>
                    <p>${escapeHTML(major)}</p>
                    <span>${escapeHTML(year)}</span>
                </div>
            `;
        }).join("");

        if ($("previewEducation")) {
            $("previewEducation").innerHTML = html;
        }
    }

    // ========================================
    // KEAHLIAN
    // ========================================

    function updateSkills() {
        const items = splitLines(getValue("skillsInput"));

        const html = items.map(item => `
            <li>${escapeHTML(item)}</li>
        `).join("");

        if ($("previewSkills")) {
            $("previewSkills").innerHTML = html;
        }
    }

    // ========================================
    // BAHASA
    // ========================================

    function updateLanguages() {
        const items = splitLines(getValue("languagesInput"));

        const html = items.map(item => `
            <li>${escapeHTML(item)}</li>
        `).join("");

        if ($("previewLanguages")) {
            $("previewLanguages").innerHTML = html;
        }
    }

    // ========================================
    // PENGALAMAN KERJA
    // Format: Jabatan|Perusahaan|Tahun|Deskripsi
    // ========================================

    function updateExperience() {
        const items = splitBlocks(getValue("experienceInput"));

        const html = items.map(item => {
            const [position = "", company = "", year = "", description = ""] =
                item.split("|");

            return `
                <div class="cv-item">
                    <h4>${escapeHTML(position)}</h4>
                    <strong>${escapeHTML(company)}</strong>
                    <span>${escapeHTML(year)}</span>
                    <p>${escapeHTML(description)}</p>
                </div>
            `;
        }).join("");

        if ($("previewExperience")) {
            $("previewExperience").innerHTML = html;
        }
    }

    // ========================================
    // REFERENSI
    // ========================================

    function updateReferences() {
        setText("previewRef1Name", getValue("ref1Name"));
        setText("previewRef1Job", getValue("ref1Job"));
        setText("previewRef1Phone", getValue("ref1Phone"));
        setText("previewRef1Email", getValue("ref1Email"));

        setText("previewRef2Name", getValue("ref2Name"));
        setText("previewRef2Job", getValue("ref2Job"));
        setText("previewRef2Phone", getValue("ref2Phone"));
        setText("previewRef2Email", getValue("ref2Email"));
    }

    // ========================================
    // UPDATE SEMUA DATA CV
    // ========================================

    function updateCV() {
        updatePersonalInfo();
        updateEducation();
        updateSkills();
        updateLanguages();
        updateExperience();
        updateReferences();
    }

    // ========================================
    // TUNGGU GAMBAR SELESAI DIMUAT
    // ========================================

    function waitForImages(element) {
        const images = Array.from(element.querySelectorAll("img"));

        return Promise.all(images.map(img => {
            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));
    }

    // ========================================
    // DOWNLOAD PDF
    // ========================================


    async function downloadPDF() {
        const button = document.getElementById("downloadButton");
        const cvElement = document.querySelector(".cv-container");

        if (!cvElement) {
            alert("CV tidak ditemukan.");
            return;
        }

        if (typeof html2pdf === "undefined") {
            alert("Library html2pdf belum dimuat.");
            return;
        }

        const originalText = button.textContent;

        try {
            button.disabled = true;
            button.textContent = "Membuat PDF...";

            // Aktifkan mode khusus ekspor
            document.body.classList.add("pdf-exporting");

            updateCV();

            await document.fonts.ready;
            await waitForImages(cvElement);

            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                });
            });

            const name = getValue("nameInput") || "CV";

            const options = {
                filename: `CV_${name.replace(/[^a-z0-9_-]/gi, "_")}.pdf`,

                margin: 0,

                image: {
                    type: "jpeg",
                    quality: 0.98
                },

                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    scrollX: 0,
                    scrollY: 0,
                    width: 794,
                    height: 1122
                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                }
            };

            await html2pdf()
                .set(options)
                .from(cvElement)
                .save();

        } catch (error) {
            console.error("PDF Error:", error);
            alert("Gagal membuat PDF: " + error.message);

        } finally {
            document.body.classList.remove("pdf-exporting");

            button.disabled = false;
            button.textContent = originalText;
        }
    }


    // ========================================
    // EVENT LISTENER
    // ========================================

    const cvForm = $("cvForm");
    const photoInput = $("photoInput");
    const downloadButton = $("downloadButton");

    if (cvForm) {
        cvForm.addEventListener("input", updateCV);
    }

    if (photoInput) {
        photoInput.addEventListener("change", updatePhoto);
    }

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadPDF);
    }

    // Tampilkan data awal
    updateCV();

});
