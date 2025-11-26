const app = (() => {
  const cursorState = {
    pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    target: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    scrollY: window.scrollY,
    scrollTimeout: null,
    visible: false,
    supportsPointer: window.matchMedia("(pointer: fine)").matches,
    raf: null,
  };

  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  function initCursor() {
    const inner = document.querySelector(".cursor--inner");
    const outer = document.querySelector(".cursor--outer");

    if (!inner || !outer || !cursorState.supportsPointer) {
      document.body.classList.add("cursor-hidden");
      return;
    }

    inner.style.transform = `translate(${cursorState.target.x}px, ${cursorState.target.y}px)`;
    outer.style.transform = `translate(${cursorState.pos.x}px, ${cursorState.pos.y}px)`;

    const updatePointer = (event) => {
      cursorState.target.x = event.clientX;
      cursorState.target.y = event.clientY;

      if (!cursorState.visible) {
        document.body.classList.add("cursor-visible");
        cursorState.visible = true;
      }
    };

    const render = () => {
      cursorState.pos.x = lerp(cursorState.pos.x, cursorState.target.x, 0.2);
      cursorState.pos.y = lerp(cursorState.pos.y, cursorState.target.y, 0.2);
      inner.style.transform = `translate(${cursorState.target.x}px, ${cursorState.target.y}px)`;
      outer.style.transform = `translate(${cursorState.pos.x}px, ${cursorState.pos.y}px)`;
      cursorState.raf = requestAnimationFrame(render);
    };

    const toggleLinkState = (active) => {
      document.body.classList.toggle("cursor-link", Boolean(active));
    };

    const handlePointerOver = (event) => {
      if (event.target.closest(".cursor-target")) {
        toggleLinkState(true);
      }
    };

    const handlePointerOut = (event) => {
      const fromTarget = event.target.closest(".cursor-target");
      if (!fromTarget) return;
      const toTarget = event.relatedTarget?.closest
        ? event.relatedTarget.closest(".cursor-target")
        : null;
      if (toTarget === fromTarget) return;
      toggleLinkState(Boolean(toTarget));
    };

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - cursorState.scrollY);
      cursorState.scrollY = window.scrollY;
      if (delta > 6) {
        document.body.classList.add("cursor-scroll");
        clearTimeout(cursorState.scrollTimeout);
        cursorState.scrollTimeout = setTimeout(() => {
          document.body.classList.remove("cursor-scroll");
        }, 200);
      }
    };

    const hideCursor = () => {
      document.body.classList.add("cursor-hidden");
      document.body.classList.remove("cursor-link", "cursor-scroll");
    };

    const showCursor = () => {
      document.body.classList.remove("cursor-hidden");
    };

    document.addEventListener("mousemove", updatePointer);
    document.addEventListener("mouseenter", showCursor);
    document.addEventListener("mouseleave", hideCursor);
    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", hideCursor);
    window.addEventListener("focus", showCursor);

    render();
  }

  function initThemeToggle() {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    const root = document.documentElement;
    const storageKey = "flux-theme";
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    let explicitChoice = false;
    let currentMode = "light";

    const applyTheme = (mode) => {
      currentMode = mode === "dark" ? "dark" : "light";
      root.classList.toggle("theme-dark", currentMode === "dark");
      toggle.setAttribute("aria-pressed", String(currentMode === "dark"));
    };

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "dark" || stored === "light") {
        explicitChoice = true;
        applyTheme(stored);
      } else {
        applyTheme(mediaQuery.matches ? "dark" : "light");
      }
    } catch (error) {
      applyTheme(mediaQuery.matches ? "dark" : "light");
    }

    toggle.addEventListener("click", () => {
      explicitChoice = true;
      const next = currentMode === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch (error) {
        /* storage might be unavailable */
      }
    });

    mediaQuery.addEventListener("change", (event) => {
      if (explicitChoice) return;
      applyTheme(event.matches ? "dark" : "light");
    });
  }

  function initNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const closeBtn = document.querySelector("[data-menu-close]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;

    const setState = (open) => {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
    };

    const openNav = () => setState(true);
    const closeNav = () => setState(false);

    toggle.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("nav-open");
      isOpen ? closeNav() : openNav();
    });

    closeBtn?.addEventListener("click", closeNav);
    panel.addEventListener("click", (event) => {
      if (event.target === panel) closeNav();
    });

    panel.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", closeNav)
    );

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  function init() {
    initCursor();
    initThemeToggle();
    initNavigation();
  }

  return { init };
})();

window.addEventListener("DOMContentLoaded", app.init);
