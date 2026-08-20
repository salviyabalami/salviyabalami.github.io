(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initMenu() {
        const toggle = document.querySelector(".menu-toggle");
        const links = document.querySelector(".nav-links");

        if (!toggle || !links) {
            return;
        }

        function closeMenu() {
            toggle.classList.remove("is-open");
            links.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
        }

        toggle.addEventListener("click", () => {
            const isOpen = links.classList.toggle("is-open");
            toggle.classList.toggle("is-open", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
            toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
        });

        links.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) {
                closeMenu();
            }
        });
    }

    function initRevealAnimations() {
        const elements = document.querySelectorAll(".reveal");

        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            elements.forEach(element => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.13,
            rootMargin: "0px 0px -7% 0px"
        });

        elements.forEach(element => observer.observe(element));
    }

    function initScrollProgress() {
        const progress = document.querySelector(".scroll-progress");

        if (!progress) {
            return;
        }

        function updateProgress() {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
        }

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    function initActiveNavigation() {
        const sectionIds = ["work", "experience", "about", "contact"];
        const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
        const sections = sectionIds
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (!sections.length || !links.length || !("IntersectionObserver" in window)) {
            return;
        }

        const linkById = new Map(
            links.map(link => [link.getAttribute("href").slice(1), link])
        );

        const observer = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (!visible.length) {
                return;
            }

            links.forEach(link => link.classList.remove("is-active"));
            linkById.get(visible[0].target.id)?.classList.add("is-active");
        }, {
            rootMargin: "-30% 0px -56% 0px",
            threshold: [0, 0.2, 0.5]
        });

        sections.forEach(section => observer.observe(section));
    }

    function initCarousel() {
        const carousel = document.querySelector(".carousel");

        if (!carousel) {
            return;
        }

        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const dotsContainer = carousel.querySelector(".carousel-dots");
        const previous = carousel.querySelector(".carousel-prev");
        const next = carousel.querySelector(".carousel-next");

        if (slides.length < 2 || !dotsContainer || !previous || !next) {
            return;
        }

        let currentIndex = 0;
        let autoplayId = null;

        const dots = slides.map((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "carousel-dot";
            dot.setAttribute("aria-label", `Show photo ${index + 1}`);
            dot.addEventListener("click", () => {
                showSlide(index);
                restartAutoplay();
            });
            dotsContainer.appendChild(dot);
            return dot;
        });

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                const isActive = slideIndex === currentIndex;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", String(!isActive));
            });

            dots.forEach((dot, dotIndex) => {
                const isActive = dotIndex === currentIndex;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-current", isActive ? "true" : "false");
            });
        }

        function stopAutoplay() {
            if (autoplayId !== null) {
                window.clearInterval(autoplayId);
                autoplayId = null;
            }
        }

        function startAutoplay() {
            if (prefersReducedMotion || document.hidden) {
                return;
            }

            stopAutoplay();
            autoplayId = window.setInterval(() => {
                showSlide(currentIndex + 1);
            }, 5200);
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        previous.addEventListener("click", () => {
            showSlide(currentIndex - 1);
            restartAutoplay();
        });

        next.addEventListener("click", () => {
            showSlide(currentIndex + 1);
            restartAutoplay();
        });

        carousel.addEventListener("mouseenter", stopAutoplay);
        carousel.addEventListener("mouseleave", startAutoplay);
        carousel.addEventListener("focusin", stopAutoplay);
        carousel.addEventListener("focusout", startAutoplay);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        let touchStartX = null;

        carousel.addEventListener("touchstart", event => {
            touchStartX = event.changedTouches[0].clientX;
        }, { passive: true });

        carousel.addEventListener("touchend", event => {
            if (touchStartX === null) {
                return;
            }

            const distance = event.changedTouches[0].clientX - touchStartX;
            touchStartX = null;

            if (Math.abs(distance) < 45) {
                return;
            }

            showSlide(currentIndex + (distance < 0 ? 1 : -1));
            restartAutoplay();
        }, { passive: true });

        showSlide(0);
        startAutoplay();
    }

    function initProjectParallax() {
        if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) {
            return;
        }

        document.querySelectorAll(".project-card").forEach(card => {
            card.addEventListener("mousemove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty("--mouse-x", `${x * 10}px`);
                card.style.setProperty("--mouse-y", `${y * 10}px`);
            });

            card.addEventListener("mouseleave", () => {
                card.style.removeProperty("--mouse-x");
                card.style.removeProperty("--mouse-y");
            });
        });
    }

    function init() {
        initMenu();
        initRevealAnimations();
        initScrollProgress();
        initActiveNavigation();
        initCarousel();
        initProjectParallax();
    }

    init();
})();
