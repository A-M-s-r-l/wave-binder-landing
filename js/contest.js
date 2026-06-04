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

    function sanitizeFilePart(value, fallback) {
        if (typeof value !== "string") {
            return fallback;
        }

        const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        return normalized || fallback;
    }

    function downloadLicenseFile(licenseData) {
        if (!licenseData || typeof licenseData !== "object") {
            return;
        }

        const fallbackRandom = String(Math.floor(Math.random() * 9000) + 1000);
        const idPart = sanitizeFilePart(
            licenseData.payload?.licenseId || licenseData.licenseId,
            `license-${fallbackRandom}`
        );
        const fileName = `licence_${idPart}.js`;
        const fileContent = JSON.stringify(licenseData, null, 2);
        const blob = new Blob([fileContent], { type: "application/json" });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
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
            phone: fields.phone.value.trim(),
            q1: fields.q1.value.trim(),
            q2: fields.q2.value.trim(),
            q3: fields.q3.value.trim(),
            newsletter: Boolean(fields.newsletter?.checked),
            cf_turnstile_response: turnstileToken
        };

        try {
            const res = await fetch("https://94winjz1x3.execute-api.eu-south-1.amazonaws.com/default/wavebinder_contest_form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            let data = null;
            let parsedBody = null;

            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (data && typeof data.body === "string") {
                try {
                    parsedBody = JSON.parse(data.body);
                } catch {
                    parsedBody = null;
                }
            }

            const effective = parsedBody && typeof parsedBody === "object" ? parsedBody : data;
            const licenseData = (
                effective &&
                typeof effective === "object" &&
                effective.license &&
                typeof effective.license === "object"
            ) ? effective.license : effective;
            const explicitFailure = effective && typeof effective === "object" && effective.success === false;
            const hasLicensePayload = Boolean(
                licenseData &&
                typeof licenseData === "object" &&
                licenseData.payload &&
                typeof licenseData.payload === "object" &&
                typeof licenseData.signature === "string" &&
                licenseData.signature.length > 0
            );

            if ((!res.ok && !hasLicensePayload) || explicitFailure) {
                showStatus(effective?.message || "Submission failed. Please try again.", "error");
                return;
            }

            playSuccessAnimation();
            showStatus(effective?.message || "Your message has been sent!", "success");
            if (hasLicensePayload) {
                downloadLicenseFile(licenseData);
            }
            form.reset();

            if (window.turnstile && typeof window.turnstile.reset === "function") {
                window.turnstile.reset();
            }

            turnstileToken = null;
        } catch (err) {
            console.error("Contest form submission error:", err);
            showStatus("Network error — please try again.", "error");
        } finally {
            stopLoading();
        }
    });

    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const accordionItem = header.parentElement;
            accordionItem?.classList.toggle("active");
        });
    });
});
