(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setExpanded(card, shouldOpen) {
        const button = card.querySelector(".experience-toggle");
        const details = card.querySelector(".experience-details");
        const actionLabel = card.querySelector(".experience-action-label");

        if (!button || !details) return;

        const isOpen = card.classList.contains("is-open");
        if (isOpen === shouldOpen) return;

        button.setAttribute("aria-expanded", String(shouldOpen));
        card.classList.toggle("is-open", shouldOpen);
        if (actionLabel) actionLabel.textContent = shouldOpen ? "Close" : "Explore";

        if (prefersReducedMotion) {
            details.hidden = !shouldOpen;
            details.style.height = shouldOpen ? "auto" : "0px";
            details.style.opacity = shouldOpen ? "1" : "0";
            return;
        }

        if (shouldOpen) {
            details.hidden = false;
            details.style.height = "0px";
            details.style.opacity = "0";

            requestAnimationFrame(() => {
                details.style.height = `${details.scrollHeight}px`;
                details.style.opacity = "1";
            });

            const finishOpen = event => {
                if (event.propertyName !== "height") return;
                details.style.height = "auto";
                details.removeEventListener("transitionend", finishOpen);
            };
            details.addEventListener("transitionend", finishOpen);
        } else {
            details.style.height = `${details.scrollHeight}px`;
            details.style.opacity = "1";

            requestAnimationFrame(() => {
                details.style.height = "0px";
                details.style.opacity = "0";
            });

            const finishClose = event => {
                if (event.propertyName !== "height") return;
                details.hidden = true;
                details.removeEventListener("transitionend", finishClose);
            };
            details.addEventListener("transitionend", finishClose);
        }
    }

    function initAccordions() {
        const cards = Array.from(document.querySelectorAll(".experience-card"));

        cards.forEach(card => {
            const button = card.querySelector(".experience-toggle");
            const details = card.querySelector(".experience-details");
            if (!button || !details) return;

            details.hidden = true;
            details.style.height = "0px";
            details.style.opacity = "0";
            details.style.transition = prefersReducedMotion
                ? "none"
                : "height 440ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease";

            button.addEventListener("click", () => {
                const shouldOpen = !card.classList.contains("is-open");

                if (shouldOpen) {
                    cards.forEach(otherCard => {
                        if (otherCard !== card) setExpanded(otherCard, false);
                    });
                }

                setExpanded(card, shouldOpen);
            });
        });
    }

    function initExperienceGalleries() {
        document.querySelectorAll("[data-experience-gallery]").forEach(gallery => {
            const slides = Array.from(gallery.querySelectorAll(".experience-slide"));
            const previous = gallery.querySelector(".experience-gallery-prev");
            const next = gallery.querySelector(".experience-gallery-next");
            const progress = gallery.querySelector(".experience-gallery-progress");

            if (slides.length < 2 || !previous || !next || !progress) return;

            let currentIndex = 0;
            const dots = slides.map(() => {
                const dot = document.createElement("span");
                dot.className = "experience-gallery-dot";
                dot.setAttribute("aria-hidden", "true");
                progress.appendChild(dot);
                return dot;
            });

            function showSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                slides.forEach((slide, slideIndex) => {
                    const active = slideIndex === currentIndex;
                    slide.classList.toggle("is-active", active);
                    slide.setAttribute("aria-hidden", String(!active));
                });
                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-active", dotIndex === currentIndex);
                });
            }

            previous.addEventListener("click", () => showSlide(currentIndex - 1));
            next.addEventListener("click", () => showSlide(currentIndex + 1));

            let touchStartX = null;
            gallery.addEventListener("touchstart", event => {
                touchStartX = event.changedTouches[0].clientX;
            }, { passive: true });
            gallery.addEventListener("touchend", event => {
                if (touchStartX === null) return;
                const distance = event.changedTouches[0].clientX - touchStartX;
                touchStartX = null;
                if (Math.abs(distance) >= 45) showSlide(currentIndex + (distance < 0 ? 1 : -1));
            }, { passive: true });

            showSlide(0);
        });
    }

    function initExperienceMotion() {
        const items = [
            document.querySelector(".experience-section .section-heading"),
            ...document.querySelectorAll(".experience-entry")
        ].filter(Boolean);

        items.forEach((item, index) => {
            item.classList.add("experience-motion");
            item.style.setProperty("--experience-motion-delay", `${Math.min(index * 70, 210)}ms`);
            item.classList.remove("is-visible");
        });

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            items.forEach(item => item.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    return;
                }

                const rect = entry.boundingClientRect;
                if (rect.bottom < 70 || rect.top > window.innerHeight - 70) {
                    entry.target.classList.remove("is-visible");
                }
            });
        }, {
            threshold: [0, 0.13, 0.32],
            rootMargin: "0px 0px -7% 0px"
        });

        items.forEach(item => observer.observe(item));
    }

    initAccordions();
    initExperienceGalleries();
    initExperienceMotion();
})();
