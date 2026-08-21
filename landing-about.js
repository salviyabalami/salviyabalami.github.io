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

    function initLandingAboutMotion() {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const motionItems = [
            { element: document.querySelector(".hero-copy"), motion: "up", delay: 40 },
            { element: document.querySelector(".hero-visual"), motion: "right", delay: 150 },
            { element: document.querySelector(".about-section .section-heading"), motion: "up", delay: 0 },
            { element: document.querySelector(".about-section .carousel"), motion: "left", delay: 70 },
            { element: document.querySelector(".about-section .about-copy"), motion: "right", delay: 130 }
        ].filter(item => item.element);

        motionItems.forEach(({ element, motion, delay }) => {
            element.classList.add("motion-reveal");
            element.dataset.motion = motion;
            element.style.setProperty("--motion-delay", `${delay}ms`);

            // index.js has a generic one-time reveal. Reset these finalized
            // sections so this observer owns their repeatable scroll motion.
            element.classList.remove("is-visible");
        });

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            motionItems.forEach(({ element }) => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    return;
                }

                const rect = entry.boundingClientRect;
                const fullyPastViewport = rect.bottom < 64 || rect.top > window.innerHeight - 64;

                if (fullyPastViewport) {
                    entry.target.classList.remove("is-visible");
                }
            });
        }, {
            threshold: [0, 0.16, 0.35],
            rootMargin: "0px 0px -7% 0px"
        });

        motionItems.forEach(({ element }) => observer.observe(element));
    }

    initLandingAboutMotion();
})();
