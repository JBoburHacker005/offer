import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

const NAV_LINKS = [
  { href: "#work", label: "Работы" },
  { href: "#process", label: "Процесс" },
  { href: "#studio", label: "Студия" },
  { href: "#contact", label: "Контакт", variant: "btn ghost" },
];

const HERO_METRICS = [
  { value: "120+", label: "реализованных релизов" },
  { value: "72%", label: "клиентов приходят по рекомендации" },
  { value: "16", label: "стран в географии проектов" },
];

const SERVICES = [
  {
    title: "Интерактивные лендинги",
    description:
      "Мягкие переходы и микроанимации, которые сопровождают пользователя по сюжету бренда.",
    detail: "3–5 недель • Motion + Story",
  },
  {
    title: "Дашборды и платформы",
    description:
      "Информационная архитектура без визуального шума и умный свет для долгой работы.",
    detail: "6 недель • Product Ops",
  },
  {
    title: "Иммерсивные кампании",
    description:
      "Кастомные эффекты с балансом производительности, которые остаются плавными на любых устройствах.",
    detail: "4 недели • WebGL Lite",
  },
  {
    title: "Design Ops сопровождение",
    description:
      "Встраиваемся в команду: подключаем систему компонентов, гайды и тестовые сценарии.",
    detail: "По подписке • Crew-as-a-service",
  },
];

const GALLERY = [
  {
    label: "Immersive retail",
    description: "Кинетика частиц и адаптивная сетка для fashion-дропа.",
  },
  {
    label: "Wellness OS",
    description: "Дашборд с биометрией и мягкими окружностями данных.",
  },
  {
    label: "Urban Atlas",
    description: "Городской гайд с темой дня/ночи и живым курсором.",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Диагностика", text: "Аудит, сценарии, поведение." },
  {
    step: "02",
    title: "Система",
    text: "Типографика, цвет, сетка, гайды взаимодействий.",
  },
  {
    step: "03",
    title: "Реализация",
    text: "Сборка на React, кастомный интерактив и тесты.",
  },
];

const SIGNALS = [
  {
    title: "Product reboot sprint",
    description: "7-дневный воркшоп с прототипом и user flow.",
    tags: ["UX", "Strategy"],
    status: "Live",
  },
  {
    title: "Motion health-check",
    description: "Диагностика анимаций и рекомендация FPS-safe эффектов.",
    tags: ["Motion", "Performance"],
    status: "New",
  },
  {
    title: "Onboarding Lab",
    description:
      "A/B сценарии, гардероб экранов и сервисный blueprint для команды.",
    tags: ["Growth", "Service design"],
    status: "Waitlist",
  },
];

const STORAGE_KEY = "flux-theme";

const useTheme = () => {
  const mediaQueryRef = useRef(null);
  const explicitChoice = useRef(false);

  if (!mediaQueryRef.current && typeof window !== "undefined") {
    mediaQueryRef.current = window.matchMedia("(prefers-color-scheme: dark)");
  }

  const getInitialTheme = () => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        explicitChoice.current = true;
        return stored;
      }
    } catch (error) {
      // storage might be unavailable
    }
    return mediaQueryRef.current?.matches ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const query = mediaQueryRef.current;
    if (!query) return;
    const handleChange = (event) => {
      if (explicitChoice.current) return;
      setTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    explicitChoice.current = true;
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
};

const useCustomCursor = () => {
  const innerRef = useRef(null);
  const outerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const supportsPointer = window.matchMedia("(pointer: fine)").matches;
    const inner = innerRef.current;
    const outer = outerRef.current;

    if (!supportsPointer || !inner || !outer) {
      document.body.classList.add("cursor-hidden");
      return () => document.body.classList.remove("cursor-hidden");
    }

    const cursorState = {
      pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      target: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      scrollY: window.scrollY,
      scrollTimeout: null,
      raf: null,
    };

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const updatePointer = (event) => {
      cursorState.target.x = event.clientX;
      cursorState.target.y = event.clientY;
      if (!document.body.classList.contains("cursor-visible")) {
        document.body.classList.add("cursor-visible");
      }
    };

    const render = () => {
      cursorState.pos.x = lerp(cursorState.pos.x, cursorState.target.x, 0.2);
      cursorState.pos.y = lerp(cursorState.pos.y, cursorState.target.y, 0.2);
      inner.style.transform = `translate(${cursorState.target.x}px, ${cursorState.target.y}px)`;
      outer.style.transform = `translate(${cursorState.pos.x}px, ${cursorState.pos.y}px)`;
      cursorState.raf = window.requestAnimationFrame(render);
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
      const related = event.relatedTarget?.closest
        ? event.relatedTarget.closest(".cursor-target")
        : null;
      if (related === fromTarget) return;
      toggleLinkState(Boolean(related));
    };

    const handleScroll = () => {
      const delta = Math.abs(window.scrollY - cursorState.scrollY);
      cursorState.scrollY = window.scrollY;
      if (delta > 6) {
        document.body.classList.add("cursor-scroll");
        window.clearTimeout(cursorState.scrollTimeout);
        cursorState.scrollTimeout = window.setTimeout(() => {
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
    cursorState.raf = window.requestAnimationFrame(render);

    return () => {
      document.removeEventListener("mousemove", updatePointer);
      document.removeEventListener("mouseenter", showCursor);
      document.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", hideCursor);
      window.removeEventListener("focus", showCursor);
      window.cancelAnimationFrame(cursorState.raf);
      window.clearTimeout(cursorState.scrollTimeout);
      document.body.classList.remove(
        "cursor-visible",
        "cursor-link",
        "cursor-scroll"
      );
    };
  }, []);

  return { innerRef, outerRef };
};

const CustomCursor = () => {
  const { innerRef, outerRef } = useCustomCursor();
  return (
    <>
      <div className="cursor cursor--outer" ref={outerRef} aria-hidden="true" />
      <div className="cursor cursor--inner" ref={innerRef} aria-hidden="true" />
    </>
  );
};

const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="section-head">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>
    {description && <p className="lead">{description}</p>}
  </div>
);

const SiteHeader = ({ theme, onThemeToggle, onMenuToggle, menuOpen }) => (
  <header className="site-header">
    <div className="container">
      <div className="brand">Flux Studio</div>
      <nav className="site-nav" aria-label="Основная навигация">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`cursor-target ${link.variant ?? ""}`.trim()}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="theme-toggle cursor-target"
          type="button"
          aria-label="Переключить тему"
          aria-pressed={theme === "dark"}
          onClick={onThemeToggle}
        >
          <span className="icon icon--sun" />
          <span className="icon icon--moon" />
        </button>
        <button
          className="menu-trigger cursor-target"
          type="button"
          aria-label="Меню"
          aria-expanded={menuOpen}
          onClick={() => onMenuToggle((prev) => !prev)}
        >
          <span />
          <span />
        </button>
      </div>
    </div>
  </header>
);

const MobileMenu = ({ open, onClose }) => (
  <div
    className="mobile-menu"
    aria-hidden={!open}
    role="dialog"
    aria-label="Мобильное меню"
    onClick={(event) => {
      if (event.target.classList.contains("mobile-menu")) {
        onClose();
      }
    }}
  >
    <div className="mobile-menu__inner">
      <button
        className="mobile-menu__close cursor-target"
        type="button"
        aria-label="Закрыть меню"
        onClick={onClose}
      >
        <span />
        <span />
      </button>
      <nav>
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="cursor-target"
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  </div>
);

const Hero = () => (
  <section className="hero" id="hero">
    <div className="hero-content container">
      <p className="eyebrow">минимализм • свет • акцент</p>
      <h1>Дизайн, который заставляет остановиться и почувствовать момент.</h1>
      <p className="lead">
        Мы создаём цифровой опыт с мягкими анимациями, чистым пространством и
        интуитивной навигацией. Прокатитесь взглядом — курсор проведёт.
      </p>
      <div className="hero-actions">
        <a href="#work" className="btn primary cursor-target">
          Смотреть кейсы
        </a>
        <a href="#contact" className="btn text cursor-target">
          Обсудить проект
        </a>
      </div>
      <div className="hero-meta">
        <span className="hero-chip cursor-target">
          UX • Motion • Digital Mindfulness
        </span>
        <ul className="hero-metrics">
          {HERO_METRICS.map((metric) => (
            <li key={metric.label}>
              <span>{metric.value}</span>
              {metric.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="hero-visual cursor-target" aria-hidden="true">
      <div className="orb orb--accent" />
      <div className="orb orb--neutral" />
      <div className="grid" />
    </div>
  </section>
);

const ServicesSection = () => (
  <section id="work" className="section">
    <div className="container">
      <SectionHeading
        eyebrow="От концепции до живых продуктов"
        title="Свободное пространство для ярких идей"
      />
      <div className="cards">
        {SERVICES.map((service) => (
          <article className="card cursor-target" key={service.title}>
            <div className="card-top">
              <h3>{service.title}</h3>
              <span className="card-detail">{service.detail}</span>
            </div>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const GallerySection = () => (
  <section id="studio" className="section section--gallery">
    <div className="container">
      <SectionHeading
        eyebrow="Свежие визуальные истории"
        title="Каждый проект как маленькая сцена света"
      />
      <div className="gallery">
        {GALLERY.map((item) => (
          <figure key={item.label} className="gallery-card cursor-target">
            <figcaption>
              <span>{item.label}</span>
              {item.description}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

const ProcessSection = () => (
  <section id="process" className="section section--split">
    <div className="container">
      <div className="split-content">
        <div>
          <p className="eyebrow">Три шага к результату</p>
          <h2>Прозрачный процесс и чёткие сроки</h2>
          <p>
            Соединяем исследование, дизайн-систему и микровзаимодействия, чтобы
            каждый экран чувствовался живым, но не перегруженным. Весь прогресс
            виден в едином трекере спринтов.
          </p>
        </div>
        <ul className="steps">
          {PROCESS_STEPS.map((step) => (
            <li key={step.step} className="cursor-target">
              <span>{step.step}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

const SignalsSection = () => (
  <section className="section section--signals">
    <div className="container">
      <SectionHeading
        eyebrow="Сигналы студии"
        title="Что сейчас в работе"
        description="Экспресс-программы, которые можно подключить отдельно от полного проекта."
      />
      <div className="signal-grid">
        {SIGNALS.map((signal) => (
          <article key={signal.title} className="signal-card cursor-target">
            <header>
              <span className="signal-status">{signal.status}</span>
              <h3>{signal.title}</h3>
            </header>
            <p>{signal.description}</p>
            <div className="signal-tags">
              {signal.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="section section--cta cursor-target">
    <div className="container">
      <h2>Пора оживить ваш проект</h2>
      <p>
        Оставьте заявку — вернёмся с концепцией и таймлайном в течение двух
        дней. Первичный звонок бесплатно, agenda приходит заранее.
      </p>
      <a href="mailto:hello@flux.studio" className="btn primary cursor-target">
        hello@flux.studio
      </a>
    </div>
  </section>
);

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="container">
      <span>© 2025 Flux Studio</span>
      <span>Минимализм. Свет. Живой курсор.</span>
      <span>React + thoughtful motion</span>
    </div>
  </footer>
);

const App = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (menuOpen) {
      body.classList.add("nav-open");
    } else {
      body.classList.remove("nav-open");
    }
    return () => body.classList.remove("nav-open");
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  return (
    <>
      <CustomCursor />
      <SiteHeader
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={setMenuOpen}
        menuOpen={menuOpen}
      />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main>
        <Hero />
        <ServicesSection />
        <GallerySection />
        <ProcessSection />
        <SignalsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

