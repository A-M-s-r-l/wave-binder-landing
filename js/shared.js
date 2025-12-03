/* LENIS SCROLL ------------------------------------------------------------- */
const lenis = new Lenis({
    duration: 5,
    smooth: true,
    smoothTouch: true,
    direction: 'vertical'
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

/* THEME SELECTOR -------------------------------------------------------------------------------------- */
const themeToggle = document.getElementById("themeToggle");

// Check if user has a saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    themeToggle.checked = true;
} else if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
    themeToggle.checked = false;
} else {
    // No saved theme → use system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
        document.documentElement.classList.add("dark");
        themeToggle.checked = true;
    }
}

/* LOGO SWITCHER ------------------------------------------------------------- */
function updateLogos() {
    const lightLogos = document.querySelectorAll(".logo-light");
    const darkLogos = document.querySelectorAll(".logo-dark");
    const isDark = document.documentElement.classList.contains("dark");

    // If no logos exist, exit silently
    if (!lightLogos.length && !darkLogos.length) return;

    lightLogos.forEach(logo => {
        logo.style.display = isDark ? "none" : "block";
    });

    darkLogos.forEach(logo => {
        logo.style.display = isDark ? "block" : "none";
    });
}

// Run on page load
updateLogos();

// Toggle theme manually
themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }

    updateLogos();
});

