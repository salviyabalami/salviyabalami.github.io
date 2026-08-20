(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyExperienceContentUpdates() {
        const janeDetails = document.getElementById("experience-jane-details");
        const janeCard = janeDetails?.closest(".experience-card");

        if (janeCard) {
            const summary = janeCard.querySelector(".experience-summary");
            if (summary) {
                summary.textContent = "A multi-day program in New York centered on trading, quantitative reasoning, and insight into Jane Street’s interview process and culture.";
            }

            const points = janeCard.querySelector(".experience-points");
            if (points) {
                points.innerHTML = `
                    <li><strong>Trading and markets.</strong> Worked through trading fundamentals, market-design ideas, and exercises built around decision-making under uncertainty.</li>
                    <li><strong>Quantitative problem solving.</strong> Practiced estimation, structured reasoning, and collaborative problem solving with other participants and Jane Street engineers.</li>
                    <li><strong>Jane Street insight.</strong> Got a closer look at the interview process and the technical, communication, and collaborative skills Jane Street emphasizes in candidates and employees.</li>
                `;
            }

            const topics = janeCard.querySelector(".experience-tech");
            if (topics) {
                topics.innerHTML = "<span>Trading & Markets</span><span>Quant Problem Solving</span><span>Jane Street Insight</span>";
                topics.setAttribute("aria-label", "Jane Street FOCUS topics");
            }

            const visual = janeCard.querySelector(".jane-visual");
            if (visual) {
                visual.innerHTML = `
                    <div class="jane-logo-only">
                        <img src="images/jane-street-focus-mark.png" alt="Jane Street circular logo">
                        <span>FOCUS · NEW YORK · 2025</span>
                    </div>
                `;
                Object.assign(visual.style, {
                    position: "absolute",
                    inset: "0",
                    display: "grid",
                    placeItems: "center",
                    background: "radial-gradient(circle at 50% 42%, rgba(0, 201, 255, .08), transparent 17rem), linear-gradient(145deg, #06131c, #081b26)"
                });

                const logoBlock = visual.querySelector(".jane-logo-only");
                if (logoBlock) {
                    Object.assign(logoBlock.style, {
                        display: "grid",
                        justifyItems: "center",
                        gap: "24px",
                        padding: "36px",
                        textAlign: "center"
                    });
                }

                const logo = visual.querySelector(".jane-logo-only img");
                if (logo) {
                    Object.assign(logo.style, {
                        width: "clamp(150px, 42%, 230px)",
                        height: "auto",
                        display: "block",
                        filter: "drop-shadow(0 0 24px rgba(0, 201, 255, .08))"
                    });
                }

                const caption = visual.querySelector(".jane-logo-only span");
                if (caption) {
                    Object.assign(caption.style, {
                        color: "var(--accent-soft)",
                        fontSize: ".72rem",
                        fontWeight: "680",
                        letterSpacing: ".16em",
                        textTransform: "uppercase"
                    });
                }
            }
        }

        const rockwellGallery = document.querySelector('[data-experience-gallery][aria-label="Rockwell Automation photos"]');
        const rockwellStage = rockwellGallery?.querySelector(".experience-gallery-stage");

        if (rockwellStage) {
            const extraSlides = [
                {
                    src: "images/experience-rockwell-presentation.webp",
                    alt: "Salviya and fellow Rockwell Automation interns presenting at an intern event in Milwaukee"
                },
                {
                    src: "images/experience-rockwell-intern-group.webp",
                    alt: "Rockwell Automation intern group together outside a Milwaukee event venue"
                }
            ];

            extraSlides.forEach(({ src, alt }) => {
                if (rockwellStage.querySelector(`img[src="${src}"]`)) return;
                const figure = document.createElement("figure");
                figure.className = "experience-slide";
                const image = document.createElement("img");
                image.src = src;
                image.alt = alt;
                figure.appendChild(image);
                rockwellStage.appendChild(figure);
            });

            const desiredOrder = [
                "images/experience-rockwell-rooftop.webp",
                "images/experience-rockwell-intern-group.webp",
                "images/experience-rockwell-office.webp",
                "images/experience-rockwell-presentation.webp",
                "images/experience-rockwell-group.webp"
            ];

            desiredOrder.forEach(src => {
                const slide = Array.from(rockwellStage.querySelectorAll(".experience-slide"))
                    .find(item => item.querySelector("img")?.getAttribute("src") === src);
                if (slide) rockwellStage.appendChild(slide);
            });
        }
    }

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
                if (shouldOpen) cards.forEach(other => other !== card && setExpanded(other, false));
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
            progress.innerHTML = "";
            const dots = slides.map(() => {
                const dot = document.createElement("span");
                dot.className = "experience-gallery-dot";
                dot.setAttribute("aria-hidden", "true");
                progress.appendChild(dot);
                return dot;
            });

            function showSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                slides.forEach((slide, i) => {
                    const active = i === currentIndex;
                    slide.classList.toggle("is-active", active);
                    slide.setAttribute("aria-hidden", String(!active));
                });
                dots.forEach((dot, i) => dot.classList.toggle("is-active", i === currentIndex));
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

    applyExperienceContentUpdates();
    initAccordions();
    initExperienceGalleries();
    initExperienceMotion();
})();