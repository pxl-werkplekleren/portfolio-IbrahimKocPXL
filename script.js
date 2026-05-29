document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("is-loaded");

    createScrollProgress();
    markActiveNavigation();
    setupMobileNavigation();
    setupRevealAnimation();
    setupWplTabs();
    setupCounters();
    setupInteractiveCards();
});

function createScrollProgress() {
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.prepend(progress);

    const updateProgress = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progressValue = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progress.style.transform = `scaleX(${Math.min(progressValue, 1)})`;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
}

function markActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach((link) => {
        const targetPage = link.getAttribute("href");
        if (targetPage === currentPage) {
            link.classList.add("is-active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function setupMobileNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".main-nav");

    if (!toggle || !navigation) {
        return;
    }

    const closeNavigation = () => {
        toggle.classList.remove("is-open");
        navigation.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.classList.toggle("is-open");
        navigation.classList.toggle("is-open", isOpen);
        document.body.classList.toggle("nav-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation();
        }
    });
}

function setupRevealAnimation() {
    const elements = document.querySelectorAll(
        ".hero-panel, .content-card, .role-card, .subcard, .metric-card, .tab-shell, .section-heading"
    );

    elements.forEach((element, index) => {
        element.classList.add("animate-card");
        element.classList.remove("is-animated");
        element.style.setProperty("--card-delay", `${Math.min(index * 70, 420)}ms`);
    });

    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-animated"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-animated");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -70px 0px"
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            elements.forEach((element) => observer.observe(element));
        });
    });
}

function setupWplTabs() {
    document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
        const buttons = tabGroup.querySelectorAll("[data-tab-target]");
        const panels = tabGroup.querySelectorAll("[data-tab-panel]");

        buttons.forEach((button, index) => {
            button.setAttribute("role", "tab");
            button.setAttribute("aria-selected", button.classList.contains("is-active") ? "true" : "false");
            button.setAttribute("tabindex", button.classList.contains("is-active") ? "0" : "-1");

            const panel = panels[index];
            if (panel) {
                panel.setAttribute("role", "tabpanel");
            }

            button.addEventListener("click", () => activateTab(buttons, panels, button.dataset.tabTarget));
            button.addEventListener("keydown", (event) => {
                const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                if (!direction) {
                    return;
                }

                event.preventDefault();
                const currentIndex = Array.from(buttons).indexOf(button);
                const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
                buttons[nextIndex].focus();
                activateTab(buttons, panels, buttons[nextIndex].dataset.tabTarget);
            });
        });
    });
}

function activateTab(buttons, panels, target) {
    buttons.forEach((item) => {
        const isActive = item.dataset.tabTarget === target;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        item.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tabPanel === target);
    });
}

function setupCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) {
        return;
    }

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.count);
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            counter.textContent = Math.round(target * eased);

            if (elapsed < 1) {
                requestAnimationFrame(tick);
            } else if (target === 100) {
                counter.textContent = "100%";
            }
        };

        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach((counter) => observer.observe(counter));
}

function setupInteractiveCards() {
    if (window.matchMedia("(pointer: coarse)").matches) {
        return;
    }

    const cards = document.querySelectorAll(".hero-panel, .content-card, .role-card, .subcard, .metric-card");
    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty("--spotlight-x", `${x}%`);
            card.style.setProperty("--spotlight-y", `${y}%`);
        });

        card.addEventListener("mouseleave", () => {
            card.style.removeProperty("--spotlight-x");
            card.style.removeProperty("--spotlight-y");
        });
    });
}
