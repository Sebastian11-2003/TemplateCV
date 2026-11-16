
document.addEventListener("DOMContentLoaded", function () {

    // MOBILE MENU
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show");
    });


    // CLOSE MENU AFTER CLICK
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("show");
        });
    });


    // ACTIVE NAVIGATION
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {

            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });


    // LOGIN BUTTON
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", function (event) {
        event.preventDefault();
        alert("Halaman Login akan segera tersedia.");
    });


    // TEMPLATE PREVIEW
    // TEMPLATE PREVIEW
    const templateButtons = document.querySelectorAll(".template-btn");

    templateButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const templateName = button.dataset.template;

            if (templateName === "modern") {
                window.location.href = "/templates/modern";
            }

            else if (templateName === "professional") {
                window.location.href = "/templates/professional";
            }

            else if (templateName === "minimalist") {
                window.location.href = "/templates/minimalist";
            }

        });

    });


    // VIEW ALL TEMPLATES
    const viewAllBtn = document.getElementById("viewAllBtn");

    viewAllBtn.addEventListener("click", function (event) {
        event.preventDefault();

        alert("Halaman semua template akan dibuat pada tahap berikutnya.");
    });


    // CURRENT YEAR
    document.getElementById("currentYear").textContent =
        new Date().getFullYear();


    // CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
    document.addEventListener("click", function (event) {

        if (
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            navMenu.classList.remove("show");
        }

    });

});
