document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const statusBox = document.getElementById("form-messages");
    const submitBtn = document.getElementById("submitBtn");

    if (!form || !statusBox || !submitBtn) {
        return;
    }

    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const btnCheck = submitBtn.querySelector(".btn-success-check");
    let turnstileToken = null;

    const fields = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        q1: document.getElementById("q1"),
        q2: document.getElementById("q2"),
        q3: document.getElementById("q3"),
        rules: document.getElementById("rules"),
        newsletter: document.getElementById("newsletter")
    };

    const requiredFieldKeys = ["name", "email", "phone", "q1", "q2", "q3", "rules"];

    const validators = {
        name: value => value.length >= 2,
        email: value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
        phone: value => /^[+]?[0-9()\-\s]{6,}$/.test(value.trim()),
        q1: value => {
            try {
                const url = new URL(value);
                return ["http:", "https:"].includes(url.protocol);
            } catch {
                return false;
            }
        },
        q2: value => value.trim().length > 5,
        q3: value => value.trim().length > 5,
        rules: checked => checked === true
    };

    Object.entries(fields).forEach(([key, el]) => {
        if (!el || !requiredFieldKeys.includes(key)) {
            return;
        }

        const evt = key === "rules" ? "change" : "input";
        el.addEventListener(evt, () => validateField(key));
    });

    function validateField(key) {
        const el = fields[key];
        const validator = validators[key];

        if (!el || typeof validator !== "function") {
            return true;
        }

        const value = key === "rules" ? el.checked : el.value.trim();
        const valid = validator(value);

        el.classList.toggle("invalid", !valid);

        return valid;
    }

    function validateAllFields() {
        return requiredFieldKeys.every((key) => validateField(key));
    }

    function showStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = `status ${type}`;
        statusBox.style.display = "block";

        if (type === "error") {
            statusBox.classList.add("shake");
            setTimeout(() => statusBox.classList.remove("shake"), 300);
        }
    }

    function startLoading() {
        submitBtn.disabled = true;

        if (btnText) {
            btnText.textContent = "Sending…";
        }

        if (btnLoader) {
            btnLoader.style.display = "inline-block";
        }
    }

    function stopLoading() {
        if (btnLoader) {
            btnLoader.style.display = "none";
        }

        if (btnText) {
            btnText.textContent = "SUBMIT MY ENTRY";
        }

        submitBtn.disabled = false;
    }

    function playSuccessAnimation() {
        if (btnLoader) {
            btnLoader.style.display = "none";
        }

        if (btnCheck) {
            btnCheck.style.display = "inline-block";
        }

        submitBtn.classList.add("success");

        setTimeout(() => {
            if (btnCheck) {
                btnCheck.style.display = "none";
            }

            submitBtn.classList.remove("success");
        }, 1500);
    }

    function clearStatus() {
        statusBox.style.display = "none";
        statusBox.textContent = "";
    }

    window.turnstileCallback = function (token) {
        turnstileToken = token;
    };

    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const accordionItem = header.parentElement;
            accordionItem?.classList.toggle("active");
        });
    });
});
