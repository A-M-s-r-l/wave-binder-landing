function isEnglishPage() {
  return /\/en(\/|$)/.test(window.location.pathname.replace(/\\/g, "/"));
}

const LANG_KEY = "wb_docs_lang";

function getPreferredLanguage() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "it" || saved === "en" ? saved : "en";
}

function getLangQueryOverride() {
  const q = new URLSearchParams(window.location.search).get("lang");
  return q === "it" || q === "en" ? q : null;
}

function hrefForLanguage(targetLang) {
  const page = currentPage();
  const inEn = isEnglishPage();
  if (targetLang === "en") return inEn ? page : `en/${page}`;
  return inEn ? `../${page}` : page;
}

function enforcePreferredLanguage() {
  const page = currentPage();
  const inEn = isEnglishPage();
  const langOverride = getLangQueryOverride();

  // Home policy:
  // - default always EN
  // - allow IT only with explicit ?lang=it
  if (page === "index.html") {
    if (inEn) return;
    if (langOverride === "it") return;
    window.location.replace("en/index.html");
    return;
  }

  const preferred = getPreferredLanguage();
  const current = inEn ? "en" : "it";
  if (current === preferred) return;
  window.location.replace(hrefForLanguage(preferred));
}

enforcePreferredLanguage();
const LANG = isEnglishPage() ? "en" : "it";
const THEME_KEY = "wb_docs_theme";
const LOGO_LIGHT_URL = "https://wavebinder.it/assets/logo-light.svg";
const LOGO_DARK_URL = "https://wavebinder.it/assets/logo-dark.svg";
let currentTheme = "light";

function buildNav(lang) {
  return [
    {
      title: lang === "en" ? "Start" : "Inizio",
      items: [
        { href: "index.html", label: lang === "en" ? "Overview" : "Panoramica" },
        { href: "getting-started.html", label: lang === "en" ? "Getting Started" : "Primi passi" },
      ],
    },
    {
      title: "Guide",
      items: [
        { href: "guide-protonodes.html", label: "ProtoNodes Guide" },
        { href: "api-reference.html", label: lang === "en" ? "API Reference" : "Riferimento API" },
      ],
      folders: [
        {
          label: "Integration",
          items: [
            { href: "wave-binder-cli.html", label: "wave-binder-cli" },
            { href: "wavebinder-autodb-back.html", label: "wavebinder-autodb-back" },
          ],
        },
      ],
    },
  ];
}

function buildSearchIndex(lang) {
  return [
    {
      href: "getting-started.html",
      title: lang === "en" ? "Getting Started" : "Primi passi",
      text:
        lang === "en"
          ? "installation extapi protonodes mytables page size tangleNodes customFunctions"
          : "installazione extapi protonodes mytables page size tangleNodes customFunctions",
    },
    {
      href: "guide-protonodes.html",
      title: "ProtoNodes Guide",
      text: "USER_SELECTION SINGLE MULTI LIST COMPLEX dep REQUEST_PARAMETER BODY PATH_VARIABLE",
    },
    {
      href: "api-reference.html",
      title: "WaveBinder API",
      text: "getDataPool getNodesInfo addCustomFunction getNodeByName isReady tangleNodes",
    },
    {
      href: "wave-binder-cli.html",
      title: "wave-binder-cli",
      text: lang === "en" ? "wizard init add edit protonodes parent dependencies" : "wizard init add edit protonodes father dependencies",
    },
    {
      href: "wavebinder-autodb-back.html",
      title: "wavebinder-autodb-back",
      text: "backend crud config json expose readable writable api key sqlite mysql postgres",
    },
  ];
}

const NAV = buildNav(LANG);
const SEARCH_INDEX = buildSearchIndex(LANG);

function flattenNavItems() {
  const flat = [];
  NAV.forEach((group) => {
    group.items.forEach((item) => flat.push(item));
    (group.folders || []).forEach((folder) => {
      folder.items.forEach((item) => flat.push(item));
    });
  });
  return flat;
}

const NAV_ITEMS = flattenNavItems();
const PATH_ITEMS = NAV_ITEMS;
const FLOW_ITEMS = NAV_ITEMS;
function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function logoForTheme(theme) {
  return theme === "dark" ? LOGO_DARK_URL : LOGO_LIGHT_URL;
}

function syncThemeUI() {
  const logo = document.getElementById("brandLogo");
  if (logo) logo.src = logoForTheme(currentTheme);
  document.querySelectorAll(".docs-page-brand-logo").forEach((img) => {
    img.src = logoForTheme(currentTheme);
  });

  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;
  const isDark = currentTheme === "dark";
  btn.classList.toggle("is-dark", isDark);
  btn.setAttribute("aria-pressed", isDark ? "true" : "false");
  btn.setAttribute("aria-label", LANG === "en" ? "Toggle light and dark theme" : "Attiva tema chiaro o scuro");
  btn.textContent = isDark ? (LANG === "en" ? "Light" : "Chiaro") : (LANG === "en" ? "Dark" : "Scuro");
}

function applyTheme(theme) {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("theme-dark", currentTheme === "dark");
  localStorage.setItem(THEME_KEY, currentTheme);
  syncThemeUI();
}
function normalizeHref(href) {
  return href;
}

function currentPage() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function isActive(href, page) {
  return href.endsWith(`/${page}`) || href === page;
}

function renderSidebar() {
  const el = document.getElementById("sidebar");
  if (!el) return;

  const page = currentPage();
  let html = `<div class="brand"><img id="brandLogo" class="brand-logo" src="${logoForTheme(currentTheme)}" alt="WaveBinder" loading="lazy" referrerpolicy="no-referrer"/><span class="brand-text">Wave Binder<small>Documentation</small></span></div>`;

  NAV.forEach((group) => {
    html += `<div class="nav-group"><p class="nav-title">${group.title}</p>`;
    group.items.forEach((item) => {
      const active = isActive(item.href, page) ? "active" : "";
      html += `<a class="nav-link ${active}" href="${normalizeHref(item.href)}">${item.label}</a>`;
    });
    (group.folders || []).forEach((folder) => {
      const folderHasActive = folder.items.some((item) => isActive(item.href, page));
      html += `<details class="nav-folder" ${folderHasActive ? "open" : ""}>`;
      html += `<summary class="nav-folder-title ${folderHasActive ? "active" : ""}">${folder.label}</summary>`;
      folder.items.forEach((item) => {
        const active = isActive(item.href, page) ? "active" : "";
        html += `<a class="nav-sublink ${active}" href="${normalizeHref(item.href)}">${item.label}</a>`;
      });
      html += `</details>`;
    });
    html += "</div>";
  });

  el.innerHTML = html;
  syncThemeUI();
}

function getLanguageHref(targetLang) {
  const page = currentPage();
  const inEn = LANG === "en";
  const targetPage = page;

  if (targetLang === "en") {
    if (inEn) return targetPage;
    return `en/${targetPage}`;
  }

  if (inEn && targetPage === "index.html") return `../${targetPage}?lang=it`;
  if (!inEn) return targetPage;
  return `../${targetPage}`;
}

function renderLanguageToggle() {
  const topbar = document.querySelector(".topbar");
  if (!topbar || document.getElementById("langSwitch")) return;

  const wrap = document.createElement("div");
  wrap.id = "langSwitch";
  wrap.className = "lang-switch";
  wrap.setAttribute("aria-label", LANG === "en" ? "Language selector" : "Selettore lingua");

  [
    { code: "it", label: "IT" },
    { code: "en", label: "EN" },
  ].forEach((item) => {
    const a = document.createElement("a");
    a.className = "lang-btn";
    if (item.code === LANG) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
    a.href = getLanguageHref(item.code);
    a.addEventListener("click", () => {
      localStorage.setItem(LANG_KEY, item.code);
    });
    a.textContent = item.label;
    wrap.appendChild(a);
  });

  topbar.appendChild(wrap);
}

function renderThemeToggle() {
  const topbar = document.querySelector(".topbar");
  if (!topbar || document.getElementById("themeToggleBtn")) return;

  const btn = document.createElement("button");
  btn.id = "themeToggleBtn";
  btn.className = "theme-toggle-btn";
  btn.type = "button";
  btn.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
  topbar.appendChild(btn);
  syncThemeUI();
}
function renderSearch() {
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  if (!input || !results) return;
  const searchableIndex = SEARCH_INDEX;

  // Wrap input/results once to keep dropdown anchoring consistent.
  if (!input.parentElement?.classList.contains("search-shell")) {
    const shell = document.createElement("div");
    shell.className = "search-shell";
    input.parentElement?.insertBefore(shell, input);
    shell.appendChild(input);
    shell.appendChild(results);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.style.display = "none";
      results.innerHTML = "";
      return;
    }

    const found = searchableIndex.filter((p) => `${p.title} ${p.text}`.toLowerCase().includes(q)).slice(0, 8);

    if (found.length === 0) {
      results.style.display = "block";
      const emptyTitle = LANG === "en" ? "No results" : "Nessun risultato";
      const emptyText = LANG === "en" ? "Try another keyword." : "Prova con un'altra parola chiave.";
      results.innerHTML = `
        <div class="search-empty" aria-live="polite">
          <svg class="search-empty-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="32" cy="22" r="11" fill="none" stroke="currentColor" stroke-width="3"/>
            <path d="M21 20c2 0 3 1 4 2M43 20c-2 0-3 1-4 2M27 28h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <path d="M16 43c6-5 10-5 16 0M48 43c-6-5-10-5-16 0M14 51c7-5 11-5 18 0M50 51c-7-5-11-5-18 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>
          </svg>
          <strong>${emptyTitle}</strong>
          <small>${emptyText}</small>
        </div>
      `;
      return;
    }

    results.style.display = "block";
    results.innerHTML = found
      .map(
        (p) =>
          `<a href="${normalizeHref(p.href)}"><strong>${p.title}</strong><br><small>${p.text}</small></a>`,
      )
      .join("");
  });

  document.addEventListener("click", (ev) => {
    if (!results.contains(ev.target) && ev.target !== input) {
      results.style.display = "none";
    }
  });
}

function setupSidebarToggle() {
  const btn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const layout = document.querySelector(".layout");
  if (!btn || !sidebar || !layout) return;

  const storageKey = "wb_docs_sidebar_collapsed";
  const isMobile = () => window.matchMedia("(max-width: 900px)").matches;
  const setBtnState = (open) => {
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    btn.innerHTML = `<span class="menu-icon" aria-hidden="true">${open ? "&#10005;" : "&#9776;"}</span>`;
  };

  const persistedCollapsed = localStorage.getItem(storageKey) === "1";
  if (!isMobile() && persistedCollapsed) {
    layout.classList.add("sidebar-collapsed");
  }
  const initialOpen = isMobile() ? sidebar.classList.contains("open") : !layout.classList.contains("sidebar-collapsed");
  setBtnState(initialOpen);

  btn.addEventListener("click", () => {
    if (isMobile()) {
      const open = sidebar.classList.toggle("open");
      setBtnState(open);
      return;
    }
    const collapsed = layout.classList.toggle("sidebar-collapsed");
    localStorage.setItem(storageKey, collapsed ? "1" : "0");
    setBtnState(!collapsed);
  });

  window.addEventListener("resize", () => {
    if (isMobile()) {
      layout.classList.remove("sidebar-collapsed");
      setBtnState(sidebar.classList.contains("open"));
    } else if (localStorage.getItem(storageKey) === "1") {
      layout.classList.add("sidebar-collapsed");
      setBtnState(false);
    } else {
      setBtnState(true);
    }
  });
}

function getCurrentNavHref() {
  const page = currentPage();
  return page;
}

function findCurrentNavIndex() {
  const currentHref = getCurrentNavHref();
  return NAV_ITEMS.findIndex((item) => item.href === currentHref || item.href === currentPage());
}

function ensureBodyGrid(main) {
  if (main.querySelector(":scope > .docs-body-grid")) {
    return {
      grid: main.querySelector(":scope > .docs-body-grid"),
      article: main.querySelector(":scope > .docs-body-grid > .docs-main-column"),
    };
  }

  const grid = document.createElement("div");
  grid.className = "docs-body-grid";

  const article = document.createElement("article");
  article.className = "docs-main-column";

  while (main.firstChild) {
    article.appendChild(main.firstChild);
  }

  grid.appendChild(article);
  main.appendChild(grid);

  return { grid, article };
}

function renderBreadcrumb(article) {
  if (article.querySelector(".docs-breadcrumb")) return;

  const page = currentPage();
  const currentIndex = findCurrentNavIndex();
  const currentItem = currentIndex >= 0 ? NAV_ITEMS[currentIndex] : null;
  const h1 = article.querySelector("h1");
  const currentLabel = currentItem?.label || (h1?.textContent?.trim() || page.replace(".html", ""));

  const homeLabel = LANG === "en" ? "Documentation" : "Documentazione";

  const container = document.createElement("nav");
  container.className = "docs-breadcrumb";
  container.setAttribute("aria-label", LANG === "en" ? "Breadcrumb" : "Percorso");

  container.innerHTML = `<a href="index.html">${homeLabel}</a>`;

  container.innerHTML += `<span>/</span><strong>${currentLabel}</strong>`;
  article.prepend(container);
}

function enhanceHeader(article) {
  if (article.querySelector(".doc-header-block")) return;
  const first = article.firstElementChild;
  const second = first?.nextElementSibling;

  if (!first || first.tagName !== "H1" || !second || second.tagName !== "P") return;

  const wrap = document.createElement("section");
  wrap.className = "doc-header-block";
  first.before(wrap);
  wrap.appendChild(first);
  wrap.appendChild(second);
}

function renderPrevNext(article) {
  if (article.querySelector(".docs-pager")) return;

  const currentHref = getCurrentNavHref();
  const idx = FLOW_ITEMS.findIndex((item) => item.href === currentHref || item.href === currentPage());
  if (idx < 0) return;

  const prev = FLOW_ITEMS[idx - 1] || null;
  const next = FLOW_ITEMS[idx + 1] || null;
  if (!prev && !next) return;

  const pager = document.createElement("nav");
  pager.className = "docs-pager";
  pager.setAttribute("aria-label", LANG === "en" ? "Page navigation" : "Navigazione pagina");

  const prevLabel = LANG === "en" ? "Previous" : "Precedente";
  const nextLabel = LANG === "en" ? "Next" : "Successiva";

  pager.innerHTML = `
    <a class="pager-link ${prev ? "" : "disabled"}" ${prev ? `href="${normalizeHref(prev.href)}"` : ""}>
      <span>${prevLabel}</span>
      <strong>${prev ? prev.label : "-"}</strong>
    </a>
    <a class="pager-link ${next ? "" : "disabled"}" ${next ? `href="${normalizeHref(next.href)}"` : ""}>
      <span>${nextLabel}</span>
      <strong>${next ? next.label : "-"}</strong>
    </a>
  `;

  article.appendChild(pager);
}

function getPageTypeLabel() {
  const page = currentPage();
  if (page === "index.html") return LANG === "en" ? "Overview" : "Panoramica";
  if (page.includes("api-reference")) return LANG === "en" ? "Reference" : "Riferimento";
  return LANG === "en" ? "Guide" : "Guida";
}

function getReadingTime(article) {
  const text = (article.textContent || "").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function renderPageMetaStrip(article) {
  const currentHref = getCurrentNavHref();
  if (article.querySelector(".docs-meta-strip")) return;
  const idx = PATH_ITEMS.findIndex((item) => item.href === currentHref || item.href === currentPage());
  const total = PATH_ITEMS.length;
  const step = idx >= 0 ? `${idx + 1}/${total}` : `-/${total}`;
  const minutes = getReadingTime(article);

  const labelType = LANG === "en" ? "Type" : "Tipo";
  const labelStep = LANG === "en" ? "Path step" : "Step percorso";
  const labelRead = LANG === "en" ? "Reading time" : "Tempo lettura";
  const minText = LANG === "en" ? "min" : "min";

  const block = document.createElement("section");
  block.className = "docs-meta-strip";
  block.innerHTML = `
    <div class="meta-item"><span>${labelType}</span><strong>${getPageTypeLabel()}</strong></div>
    <div class="meta-item"><span>${labelStep}</span><strong>${step}</strong></div>
    <div class="meta-item"><span>${labelRead}</span><strong>${minutes} ${minText}</strong></div>
  `;

  const anchor = article.querySelector(".doc-header-block, .page-hero");
  if (anchor) {
    anchor.insertAdjacentElement("afterend", block);
    return;
  }
  article.prepend(block);
}

function renderQuickActions(article) {
  if (currentPage() !== "index.html") return;
  if (article.querySelector(".docs-quick-actions")) return;
  const title = LANG === "en" ? "Quick actions" : "Azioni rapide";

  const links = [
    { href: "getting-started.html", label: LANG === "en" ? "Setup" : "Setup" },
    { href: "guide-protonodes.html", label: LANG === "en" ? "Node guide" : "Guida nodi" },
    { href: "api-reference.html", label: LANG === "en" ? "API" : "API" },
  ];

  const current = getCurrentNavHref();
  const items = links
    .map((item) => {
      const active = item.href === current || item.href.endsWith(`/${currentPage()}`) ? "active" : "";
      return `<a class="qa-link ${active}" href="${normalizeHref(item.href)}">${item.label}</a>`;
    })
    .join("");

  const block = document.createElement("section");
  block.className = "docs-quick-actions";
  block.innerHTML = `<p class="qa-title">${title}</p><div class="qa-links">${items}</div>`;

  const meta = article.querySelector(".docs-meta-strip");
  if (meta) {
    meta.insertAdjacentElement("afterend", block);
    return;
  }
  article.prepend(block);
}

function enhanceDocumentationLayout() {
  const main = document.querySelector("main");
  if (!main || main.dataset.docsEnhanced === "1") return;
  main.dataset.docsEnhanced = "1";
  main.classList.add("docs-main");

  const { article } = ensureBodyGrid(main);
  renderBreadcrumb(article);
  enhanceHeader(article);
  renderPageMetaStrip(article);
  renderQuickActions(article);
  renderPrevNext(article);
}

currentTheme = getPreferredTheme();
applyTheme(currentTheme);
renderSidebar();
renderSearch();
renderLanguageToggle();
renderThemeToggle();
setupSidebarToggle();
enhanceDocumentationLayout();








