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

// Toggle theme manually
themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
});
