/* Sets privacy policy link dynamically */
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".privacy-policy-url").forEach(
        (el) => (el.href = "/assets/INFORMATIVA_PRIVACY_Wavebinder.pdf")
    )
})
