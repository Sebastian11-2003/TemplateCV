
const $ = (id) => document.getElementById(id);

// ================================
// FUNGSI BANTUAN
// ================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function getValue(id) {
    return $(id)?.value.trim() || "";
}

function setText(id, value, fallback = "") {
    const element = $(id);
    if (element) {
        element.textContent = value || fallback;
    }
}

// ================================
// UPDATE INFORMASI PRIBADI
// ================================

function updatePersonalInfo() {
    setText("previewName", getValue("nameInput"), "Nama Lengkap");
    setText("previewJob", getValue("jobInput"), "Posisi Pekerjaan");
    setText("previewSummary", getValue("summaryInput"), "Ringkasan profesional akan ditampilkan di sini.");

    setText("previewPhone", getValue("phoneInput"), "-");
    setText("previewEmail", getValue("emailInput"), "-");
    setText("previewAddress", getValue("addressInput"), "-");
    setText("previewLinkedin", getValue("linkedinInput"), "-");
}

// ================================
// UPLOAD FOTO
// ================================


function updatePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Silakan pilih file gambar.");
        event.target.value = "";
        return;
    }

    const previewPhoto = $("previewPhoto");

    if (!previewPhoto) {
        console.error("Elemen previewPhoto tidak ditemukan.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();

        image.onload = function () {
            previewPhoto.src = e.target.result;

            // Pertahankan proporsi dan bentuk foto
            previewPhoto.style.width = "100%";
            previewPhoto.style.height = "100%";
            previewPhoto.style.objectFit = "cover";
            previewPhoto.style.objectPosition = "center center";
            previewPhoto.style.borderRadius = "50%";
            previewPhoto.style.display = "block";
        };

        image.onerror = function () {
            alert("Gambar tidak dapat dibaca.");
        };

        image.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


// ================================
// PENGALAMAN KERJA
// ================================

function updateExperience() {
    const value = getValue("experienceInput");
    const preview = $("previewExperience");

    if (!preview) return;

    preview.innerHTML = value
        ? escapeHTML(value).replace(/\n/g, "<br>")
        : "Pengalaman kerja akan ditampilkan di sini.";
}

// ================================
// PENGHARGAAN
// ================================

function updateAwards() {
    const value = getValue("awardsInput");
    const preview = $("previewAwards");

    if (!preview) return;

    preview.innerHTML = value
        ? escapeHTML(value).replace(/\n/g, "<br>")
        : "Penghargaan dan pencapaian akan ditampilkan di sini.";
}

// ================================
// PENDIDIKAN
// ================================

function updateEducation() {
    const university = getValue("universityInput");
    const degree = getValue("degreeInput");
    const education = getValue("educationInput");

    const preview = $("previewEducation");

    if (!preview) return;

    const content = [
        university,
        degree,
        education
    ].filter(Boolean);

    preview.innerHTML = content.length
        ? content.map(item => `<div>${escapeHTML(item)}</div>`).join("")
        : "Informasi pendidikan akan ditampilkan di sini.";
}

// ================================
// UPDATE SELURUH CV
// ================================

function updateCV() {
    updatePersonalInfo();
    updateExperience();
    updateAwards();
    updateEducation();
}

// ================================
// TUNGGU FOTO SELESAI DIMUAT
// ================================

async function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

// ================================
// DOWNLOAD PDF
// ================================

async function downloadPDF() {
    const button = $("downloadButton");
    const cvElement = document.querySelector(".cv-container");

    if (!cvElement) {
        alert("CV tidak ditemukan.");
        return;
    }

    if (typeof html2pdf === "undefined") {
        alert("Library PDF belum dimuat.");
        return;
    }

    const originalText = button?.textContent || "Download PDF";

    const originalStyles = {
        width: cvElement.style.width,
        maxWidth: cvElement.style.maxWidth,
        minHeight: cvElement.style.minHeight,
        height: cvElement.style.height,
        margin: cvElement.style.margin,
        overflow: cvElement.style.overflow,
        transform: cvElement.style.transform,
        position: cvElement.style.position,
        left: cvElement.style.left
    };

    try {
        if (button) {
            button.disabled = true;
            button.textContent = "Membuat PDF...";
        }

        updateCV();
        await waitForImages(cvElement);

        // Atur posisi dan ukuran khusus ekspor
        cvElement.style.width = "794px";
        cvElement.style.maxWidth = "794px";
        cvElement.style.minHeight = "0";
        cvElement.style.height = "auto";
        cvElement.style.margin = "0";
        cvElement.style.overflow = "visible";
        cvElement.style.transform = "none";
        cvElement.style.position = "relative";
        cvElement.style.left = "0";

        await new Promise(resolve =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );

        const name = getValue("nameInput") || "CV";

        await html2pdf()
            .set({
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
                    logging: true,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 794,
                    width: 794,
                    x: 0
                },

                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                },

                pagebreak: {
                    mode: ["css"]
                }
            })
            .from(cvElement)
            .save();

    } catch (error) {
        console.error("PDF Error:", error);
        alert("Gagal membuat PDF. Periksa Console browser.");

    } finally {
        Object.assign(cvElement.style, originalStyles);

        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
}

// ================================
// EVENT LISTENER
// ================================

document.addEventListener("DOMContentLoaded", () => {

    // Live preview seluruh input
    const inputIds = [
        "nameInput",
        "jobInput",
        "summaryInput",
        "phoneInput",
        "emailInput",
        "addressInput",
        "linkedinInput",
        "experienceInput",
        "awardsInput",
        "universityInput",
        "degreeInput",
        "educationInput"
    ];

    inputIds.forEach((id) => {
        const element = $(id);

        if (element) {
            element.addEventListener("input", updateCV);
        }
    });

    // Upload foto
    const photoInput = $("photoInput");

    if (photoInput) {
        photoInput.addEventListener("change", updatePhoto);
    }

    // Tombol download PDF
    const downloadButton = $("downloadButton");

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadPDF);
    }

    // Tampilkan data awal
    updateCV();
});
