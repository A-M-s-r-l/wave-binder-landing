document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const statusBox = document.getElementById("form-messages");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const btnCheck = submitBtn.querySelector(".btn-success-check");

    const fields = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        q1: document.getElementById("q1"),
        q2: document.getElementById("q2"),
        privacy: document.getElementById("privacy")
    };

    const validators = {
        name: v => v.length >= 2,
        email: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
        phone: v => v.trim().length >= 5,
        q1: v => v.trim().length > 3,
        q2: v => v.trim().length > 5,
        privacy: checked => checked
    };

    // Live validation
    Object.entries(fields).forEach(([key, el]) => {
        const evt = key === "privacy" ? "change" : "input";
        el.addEventListener(evt, () => validateField(key));
    });

    function validateField(key) {
        const el = fields[key];
        const value = key === "privacy" ? el.checked : el.value.trim();
        const valid = validators[key](value);

        if (!valid) el.classList.add("invalid");
        else el.classList.remove("invalid");

        return valid;
    }

    function validateAllFields() {
        return Object.keys(fields).every(key => validateField(key));
    }

    function showStatus(msg, type) {
        statusBox.textContent = msg;
        statusBox.className = `status ${type}`;
        statusBox.style.display = "block";

        if (type === "error") {
            statusBox.classList.add("shake");
            setTimeout(() => statusBox.classList.remove("shake"), 300);
        }
    }

    function clearStatus() {
        statusBox.style.display = "none";
        statusBox.textContent = "";
    }

    // Button animations
    function startLoading() {
        submitBtn.disabled = true;
        btnText.textContent = "Sending…";
        btnLoader.style.display = "inline-block";
    }

    function stopLoading() {
        btnLoader.style.display = "none";
        btnText.textContent = "Send";
        submitBtn.disabled = false;
    }

    function playSuccessAnimation() {
        btnLoader.style.display = "none";
        btnCheck.style.display = "inline-block";
        submitBtn.classList.add("success");

        setTimeout(() => {
            btnCheck.style.display = "none";
            submitBtn.classList.remove("success");
        }, 1500);
    }

    // Submit handler (no page reload)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearStatus();

        if (!validateAllFields()) {
            showStatus("Please check the highlighted fields.", "error");
            return;
        }

        const token = grecaptcha.getResponse();
        if (!token) {
            showStatus("Please complete the reCAPTCHA.", "error");
            return;
        }

        startLoading();

        const payload = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            q1: fields.q1.value.trim(),
            q2: fields.q2.value.trim(),
            privacy: fields.privacy.checked,
            "g-recaptcha-response": token
        };

        try {
            const res = await fetch("https://94winjz1x3.execute-api.eu-south-1.amazonaws.com/default/wavebinder_contest_form", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                playSuccessAnimation();
                showStatus("Your message has been sent!", "success");
                form.reset();
                grecaptcha.reset();
            } else {
                showStatus(data.message || "Submission failed.", "error");
            }

        } catch (err) {
            console.error(err);
            showStatus("Network error — please try again.", "error");
        }

        stopLoading();
    });
});
