document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");
    const statusBox = document.getElementById("form-messages");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoader = submitBtn.querySelector(".btn-loader");
    const btnCheck = submitBtn.querySelector(".btn-success-check");
    let turnstileToken = null;

    const fields = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        //privacy: document.getElementById("privacy")
    };

    const validators = {
        name: v => v.length >= 2,
        email: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
        //privacy: checked => checked
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

    // Button animations
    function startLoading() {
        submitBtn.disabled = true;
        btnText.textContent = "Sending…";
        btnLoader.style.display = "inline-block";
    }

    function stopLoading() {
        btnLoader.style.display = "none";
        btnText.textContent = "SUBMIT MY ENTRY";
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

    function clearStatus() {
        statusBox.style.display = "none";
        statusBox.textContent = "";
    }

    window.turnstileCallback = function (token) {
        turnstileToken = token;
    };

    // Submit handler (no page reload)
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
            //privacy: fields.privacy.checked,
            cf_turnstile_response: turnstileToken
        };

        try {
            const res = await fetch("https://23qs3jirm2.execute-api.eu-south-1.amazonaws.com/default/wavebinder_contact_form", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                playSuccessAnimation();
                showStatus("Your message has been sent!", "success");
                form.reset();
                turnstile.reset();
                turnstileToken = null;
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
