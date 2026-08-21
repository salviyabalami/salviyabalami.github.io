(() => {
    "use strict";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const projectConfigs = {
        xray: {
            label: "Animated architecture for the chest X-ray classification project",
            nodes: [
                { label: "CLAHE", x: 14, y: 24, ampX: 1.8, ampY: 2.2, phase: 0.4 },
                { label: "Transfer Learning", x: 19, y: 72, ampX: 2.0, ampY: 1.5, phase: 1.7, muted: true },
                { label: "DenseNet121", x: 45, y: 24, ampX: 2.2, ampY: 1.7, phase: 2.7, primary: true },
                { label: "ResNet50", x: 45, y: 66, ampX: 1.8, ampY: 2.0, phase: 4.0, primary: true },
                { label: "Weighted Ensemble", x: 72, y: 43, ampX: 1.6, ampY: 1.9, phase: 5.2, primary: true },
                { label: "Multi-label Output", x: 84, y: 72, ampX: 1.4, ampY: 1.6, phase: 3.2 },
                { label: "AUC · F1 · Recall", x: 72, y: 16, ampX: 1.5, ampY: 1.3, phase: 6.0, muted: true }
            ],
            edges: [[0, 2], [0, 3], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5], [4, 6]]
        },
        music: {
            label: "Animated architecture for the music popularity ensemble project",
            metric: { value: "0.8375", label: "OOF AUC" },
            nodes: [
                { label: "Feature Engineering", x: 15, y: 18, ampX: 1.6, ampY: 1.8, phase: 0.4 },
                { label: "Grid Search", x: 15, y: 48, ampX: 1.8, ampY: 1.4, phase: 1.5, muted: true },
                { label: "Gradient Boosting", x: 16, y: 79, ampX: 1.7, ampY: 1.5, phase: 2.8, muted: true },
                { label: "XGBoost", x: 43, y: 18, ampX: 2.0, ampY: 1.7, phase: 3.9, primary: true },
                { label: "LightGBM", x: 43, y: 48, ampX: 1.7, ampY: 2.0, phase: 5.1, primary: true },
                { label: "CatBoost", x: 43, y: 78, ampX: 1.9, ampY: 1.6, phase: 6.0, primary: true },
                { label: "Meta Learner", x: 73, y: 45, ampX: 1.7, ampY: 1.8, phase: 2.0, primary: true },
                { label: "Stratified CV", x: 74, y: 16, ampX: 1.5, ampY: 1.4, phase: 4.7, muted: true },
                { label: "Class Balancing", x: 74, y: 76, ampX: 1.4, ampY: 1.7, phase: 5.7, muted: true }
            ],
            edges: [
                [0, 3], [0, 4], [0, 5],
                [1, 3], [1, 4], [1, 5],
                [2, 3], [2, 4], [2, 5],
                [3, 6], [4, 6], [5, 6],
                [7, 6], [8, 3], [8, 4], [8, 5]
            ]
        }
    };

    function ensureStyles() {
        if (document.querySelector('link[href="project-interactive.css"]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "project-interactive.css";
        document.head.appendChild(link);
    }

    function setFocusedNode(system, nodeElements, lineElements, index) {
        nodeElements.forEach((node, nodeIndex) => {
            node.classList.toggle("is-focus", nodeIndex === index);
        });

        lineElements.forEach(line => {
            const from = Number(line.dataset.from);
            const to = Number(line.dataset.to);
            line.classList.toggle("is-focus", from === index || to === index);
        });

        system.dataset.focusedNode = String(index);
    }

    function buildProjectSystem(card, config) {
        const visual = card.querySelector(".project-visual");
        if (!visual || visual.dataset.systemReady === "true") return;

        visual.dataset.systemReady = "true";
        visual.classList.add("project-system-visual");
        visual.setAttribute("aria-label", config.label);
        visual.removeAttribute("aria-hidden");

        const system = document.createElement("div");
        system.className = "project-system";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("project-system-links");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("aria-hidden", "true");
        system.appendChild(svg);

        const lineElements = config.edges.map(([from, to]) => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.classList.add("project-system-link");
            line.dataset.from = String(from);
            line.dataset.to = String(to);
            svg.appendChild(line);
            return line;
        });

        const nodeElements = config.nodes.map((nodeConfig, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "project-system-node";
            if (nodeConfig.primary) wrapper.classList.add("is-primary");
            if (nodeConfig.muted) wrapper.classList.add("is-muted");
            wrapper.tabIndex = 0;
            wrapper.setAttribute("role", "group");
            wrapper.setAttribute("aria-label", nodeConfig.label);
            wrapper.dataset.nodeIndex = String(index);

            const inner = document.createElement("div");
            inner.className = "project-system-node-inner";
            inner.textContent = nodeConfig.label;
            wrapper.appendChild(inner);
            system.appendChild(wrapper);
            return wrapper;
        });

        if (config.metric) {
            const metric = document.createElement("div");
            metric.className = "project-system-metric";
            metric.innerHTML = `${config.metric.value}<span>${config.metric.label}</span>`;
            system.appendChild(metric);
        }

        visual.replaceChildren(system);

        let cycleIndex = config.nodes.findIndex(node => node.primary);
        if (cycleIndex < 0) cycleIndex = 0;
        let interactionIndex = null;
        let animationFrame = null;
        let cycleTimer = null;

        function render(time = 0) {
            const seconds = time / 1000;
            const positions = config.nodes.map((node, index) => {
                const phase = node.phase ?? index;
                if (prefersReducedMotion) return { x: node.x, y: node.y };
                return {
                    x: node.x + Math.sin(seconds * 0.62 + phase) * (node.ampX ?? 1.5),
                    y: node.y + Math.cos(seconds * 0.54 + phase * 1.13) * (node.ampY ?? 1.5)
                };
            });

            nodeElements.forEach((element, index) => {
                element.style.left = `${positions[index].x}%`;
                element.style.top = `${positions[index].y}%`;
            });

            lineElements.forEach(line => {
                const from = positions[Number(line.dataset.from)];
                const to = positions[Number(line.dataset.to)];
                line.setAttribute("x1", from.x);
                line.setAttribute("y1", from.y);
                line.setAttribute("x2", to.x);
                line.setAttribute("y2", to.y);
            });

            if (!prefersReducedMotion) animationFrame = requestAnimationFrame(render);
        }

        function cycleFocus() {
            const primaryIndexes = config.nodes
                .map((node, index) => node.primary ? index : null)
                .filter(index => index !== null);
            const candidates = primaryIndexes.length ? primaryIndexes : config.nodes.map((_, index) => index);
            const currentPosition = Math.max(0, candidates.indexOf(cycleIndex));
            cycleIndex = candidates[(currentPosition + 1) % candidates.length];
            if (interactionIndex === null) setFocusedNode(system, nodeElements, lineElements, cycleIndex);
        }

        nodeElements.forEach((node, index) => {
            const beginInteraction = () => {
                interactionIndex = index;
                setFocusedNode(system, nodeElements, lineElements, index);
            };
            const endInteraction = () => {
                interactionIndex = null;
                setFocusedNode(system, nodeElements, lineElements, cycleIndex);
            };
            node.addEventListener("mouseenter", beginInteraction);
            node.addEventListener("mouseleave", endInteraction);
            node.addEventListener("focus", beginInteraction);
            node.addEventListener("blur", endInteraction);
        });

        render(0);
        setFocusedNode(system, nodeElements, lineElements, cycleIndex);

        if (!prefersReducedMotion) {
            cycleTimer = window.setInterval(cycleFocus, 2400);
        }

        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                    return;
                }
                if (!prefersReducedMotion && animationFrame === null) animationFrame = requestAnimationFrame(render);
            });
        }, { threshold: 0.02 });
        sectionObserver.observe(visual);

        window.addEventListener("pagehide", () => {
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            if (cycleTimer !== null) clearInterval(cycleTimer);
        }, { once: true });
    }

    function addCollaborationControl(card) {
        const copy = card.querySelector(".project-copy");
        const tagList = copy?.querySelector(".tag-list");
        if (!copy || copy.querySelector(".project-collab")) return;

        const widget = document.createElement("div");
        widget.className = "project-collab";
        widget.innerHTML = `
            <button class="project-team-toggle" type="button" aria-expanded="false">
                <span class="project-team-icon" aria-hidden="true"></span>
                <span>Team</span>
            </button>
            <div class="project-collab-panel" aria-hidden="true">
                <span>Collaborated with:</span>
                <a href="https://www.linkedin.com/in/charles-williamson-1748b7310/" target="_blank" rel="noreferrer">Chase Williamson <span>↗</span></a>
                <a href="https://www.linkedin.com/in/stuartflorescu/" target="_blank" rel="noreferrer">Stuart Florescu <span>↗</span></a>
            </div>
        `;

        if (tagList) tagList.insertAdjacentElement("afterend", widget);
        else copy.appendChild(widget);

        const toggle = widget.querySelector(".project-team-toggle");
        const panel = widget.querySelector(".project-collab-panel");

        function close() {
            widget.classList.remove("is-open");
            card.classList.remove("collab-open");
            toggle.setAttribute("aria-expanded", "false");
            panel.setAttribute("aria-hidden", "true");
        }

        toggle.addEventListener("click", event => {
            event.stopPropagation();
            const shouldOpen = !widget.classList.contains("is-open");
            document.querySelectorAll(".project-collab.is-open").forEach(other => {
                if (other === widget) return;
                other.classList.remove("is-open");
                other.closest(".project-card")?.classList.remove("collab-open");
                other.querySelector(".project-team-toggle")?.setAttribute("aria-expanded", "false");
                other.querySelector(".project-collab-panel")?.setAttribute("aria-hidden", "true");
            });
            widget.classList.toggle("is-open", shouldOpen);
            card.classList.toggle("collab-open", shouldOpen);
            toggle.setAttribute("aria-expanded", String(shouldOpen));
            panel.setAttribute("aria-hidden", String(!shouldOpen));
        });

        widget.addEventListener("click", event => event.stopPropagation());
        document.addEventListener("click", close);
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") close();
        });
    }

    function initProjects() {
        ensureStyles();

        const cards = Array.from(document.querySelectorAll("#projects .project-card"));
        cards.forEach(card => {
            const title = card.querySelector(".project-copy h3")?.textContent.toLowerCase() ?? "";
            const config = title.includes("x-ray") ? projectConfigs.xray
                : title.includes("music popularity") ? projectConfigs.music
                : null;
            if (config) buildProjectSystem(card, config);
            addCollaborationControl(card);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initProjects, { once: true });
    } else {
        initProjects();
    }
})();
