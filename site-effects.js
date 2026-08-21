(() => {
    "use strict";

    if (window.__portfolioEffectsInitialized) return;
    window.__portfolioEffectsInitialized = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    function initCursor() {
        if (!finePointer) return;

        const dot = document.createElement("div");
        const ring = document.createElement("div");
        dot.className = "custom-cursor-dot";
        ring.className = "custom-cursor-ring";
        dot.setAttribute("aria-hidden", "true");
        ring.setAttribute("aria-hidden", "true");
        document.body.append(dot, ring);
        document.body.classList.add("cursor-ready");

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let frame = null;

        const interactiveSelector = "a, button, [role='button'], input, textarea, select, .project-system-node, [tabindex]:not([tabindex='-1'])";

        function render() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            frame = requestAnimationFrame(render);
        }

        document.addEventListener("mousemove", event => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            document.body.classList.add("cursor-visible");
            document.body.classList.toggle("cursor-interactive", Boolean(event.target.closest?.(interactiveSelector)));
        }, { passive: true });

        document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-visible"));
        document.addEventListener("mouseenter", () => document.body.classList.add("cursor-visible"));
        document.addEventListener("mousedown", () => document.body.classList.add("cursor-pressed"));
        document.addEventListener("mouseup", () => document.body.classList.remove("cursor-pressed"));

        render();
        window.addEventListener("pagehide", () => {
            if (frame !== null) cancelAnimationFrame(frame);
        }, { once: true });
    }

    function initParticles() {
        const canvas = document.createElement("canvas");
        canvas.id = "ambient-particles";
        canvas.setAttribute("aria-hidden", "true");
        document.body.prepend(canvas);

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let particles = [];
        let animationFrame = null;
        let visible = true;

        function particleCount() {
            if (window.innerWidth <= 620) return 18;
            if (window.innerWidth <= 900) return 28;
            return 42;
        }

        function makeParticle() {
            const speedFactor = reducedMotion ? 0 : 1;
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.095 * speedFactor,
                vy: (Math.random() - 0.5) * 0.095 * speedFactor,
                radius: Math.random() * 1.05 + 0.5,
                alpha: Math.random() * 0.26 + 0.15
            };
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = particleCount();
            if (particles.length > count) particles.length = count;
            while (particles.length < count) particles.push(makeParticle());
        }

        function update() {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < -8) particle.x = width + 8;
                if (particle.x > width + 8) particle.x = -8;
                if (particle.y < -8) particle.y = height + 8;
                if (particle.y > height + 8) particle.y = -8;
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i += 1) {
                const a = particles[i];

                for (let j = i + 1; j < particles.length; j += 1) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distanceSquared = dx * dx + dy * dy;
                    const maxDistance = window.innerWidth <= 620 ? 90 : 130;
                    if (distanceSquared > maxDistance * maxDistance) continue;

                    const distance = Math.sqrt(distanceSquared);
                    const alpha = (1 - distance / maxDistance) * 0.055;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(114, 221, 247, ${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }

            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(114, 221, 247, ${particle.alpha})`;
                ctx.fill();
            });
        }

        function loop() {
            if (!visible) {
                animationFrame = null;
                return;
            }
            if (!reducedMotion) update();
            draw();
            animationFrame = requestAnimationFrame(loop);
        }

        const observer = new IntersectionObserver(entries => {
            visible = entries[0]?.isIntersecting ?? true;
            if (visible && animationFrame === null) animationFrame = requestAnimationFrame(loop);
        });
        observer.observe(document.documentElement);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                visible = false;
                if (animationFrame !== null) cancelAnimationFrame(animationFrame);
                animationFrame = null;
            } else {
                visible = true;
                if (animationFrame === null) animationFrame = requestAnimationFrame(loop);
            }
        });

        window.addEventListener("resize", resize, { passive: true });
        resize();
        draw();
        if (!reducedMotion) animationFrame = requestAnimationFrame(loop);
    }

    initParticles();
    initCursor();
})();
