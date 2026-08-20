(() => {
    "use strict";

    const buttons = document.querySelectorAll(".copy-email");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const email = button.dataset.email;
            const label = button.querySelector(".copy-label");
            const original = label?.textContent || "Copy";

            try {
                await navigator.clipboard.writeText(email);
                button.classList.add("is-copied");
                if (label) label.textContent = "Copied";

                window.setTimeout(() => {
                    button.classList.remove("is-copied");
                    if (label) label.textContent = original;
                }, 1500);
            } catch (_) {
                window.location.href = `mailto:${email}`;
            }
        });
    });
})();
