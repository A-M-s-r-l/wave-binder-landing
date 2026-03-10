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
        email: document.getElementById("email")
    };

    const requiredFieldKeys = ["name", "email"];

    const validators = {
        name: value => value.length >= 2,
        email: value => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
    };

    Object.entries(fields).forEach(([key, el]) => {
        if (!el || !requiredFieldKeys.includes(key)) {
            return;
        }

        el.addEventListener("input", () => validateField(key));
    });

    function validateField(key) {
        const el = fields[key];
        const validator = validators[key];

        if (!el || !validator) {
            return true;
        }

        const value = el.value.trim();
        const valid = validator(value);

        el.classList.toggle("invalid", !valid);

        return valid;
    }

    function validateAllFields() {
        return requiredFieldKeys.every(key => validateField(key));
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

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearStatus();

        if (!validateAllFields()) {
            showStatus("Please check the highlighted fields.", "error");
            return;
        }

        if (!turnstileToken) {
            showStatus("Please verify you are human.", "error");
            return;
        }

        startLoading();

        const payload = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            cf_turnstile_response: turnstileToken
        };

        try {
            const res = await fetch("https://23qs3jirm2.execute-api.eu-south-1.amazonaws.com/default/wavebinder_contact_form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            let data = null;

            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                showStatus(data?.message || "Submission failed. Please try again.", "error");
                return;
            }

            if (data?.success) {
                playSuccessAnimation();
                showStatus("Your message has been sent!", "success");
                form.reset();

                if (window.turnstile && typeof window.turnstile.reset === "function") {
                    window.turnstile.reset();
                }

                turnstileToken = null;
            } else {
                showStatus(data?.message || "Submission failed.", "error");
            }
        } catch (err) {
            console.error("Contact form submission error:", err);
            showStatus("Network error — please try again.", "error");
        } finally {
            stopLoading();
        }
    });
});
