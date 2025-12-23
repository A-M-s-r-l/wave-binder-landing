/* LENIS SCROLL ------------------------------------------------------------- */
const lenis = new Lenis({
    smooth: true,
    smoothTouch: true,
    syncTouch:true,
    duration: 1.1,
    gestureOrientation: 'vertical',
    direction: 'vertical',
    touchMultiplier: 1.8,
    autoRaf: true,
    autoResize: true,
})

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    /* GENERAl -------------------------------------------------------------------------- */

    //Navbar Animation
    const nav_container = document.getElementById("nav-container");
    if(nav_container) {
        nav_container.classList.add("nav-animation");
    }
    // Navbar Urls
    const links = document.querySelectorAll("ul li a");
    const currentUrl = window.location.href;

    links.forEach(link => {
        const href = link.getAttribute("href");

        // Special case for contest
        if (currentUrl.includes("/contest")) {
            if (href.includes("join") || href.includes("/contest")) {
                link.classList.add("active");
            }
        }

        // Home link
        if (href === "/" && currentUrl.endsWith("/")) {
            link.classList.add("active");
        }
    });

    /* SCROLL TO LENIS -------------------------------------------------------------------------- */
    // Contest
    const join = document.getElementById('join');
    if (join) {
        document.getElementById('join-btn').addEventListener('click', () => {
            lenis.scrollTo(join, { offset: -150, immediate: false });
        });
    }
})

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

/* Submenu click/tap support */
document.querySelectorAll('.submenu-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent closing immediately
        wrapper.classList.toggle('open');
    });
});

// Close submenu when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.submenu-wrapper.open')
        .forEach(w => w.classList.remove('open'));
});

document.addEventListener("DOMContentLoaded", () => {
    document.quer
})