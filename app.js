function bootTable(cfg) {
  const tbody = document.querySelector(cfg.tbody);
  const empty = document.querySelector(cfg.empty);
  const searchEl = document.querySelector(cfg.searchInput);
  const sortEl = document.querySelector(cfg.sortSelect);

  let rows = [];
  let filtered = [];

  fetch(cfg.json, { cache: "no-store" })
    .then(r => r.json())
    .then(data => {
      rows = Array.isArray(data) ? data : [];
      filtered = rows.slice();
      updateAndRender();
    })
    .catch(() => {
      rows = [];
      filtered = [];
      updateAndRender();
    });

  const updateAndRender = () => { doFilter(); doSort(); render(); };

  const render = () => {
    tbody.innerHTML = "";
    if (!filtered.length) { empty.hidden = false; return; }
    empty.hidden = true;
    for (const r of filtered) {
      const tr = document.createElement("tr");
      if (r.pinned) tr.classList.add("pinned");
      tr.innerHTML = cfg.columns.map(k => `<td>${escapeHtml(r[k] ?? "")}</td>`).join("");
      tbody.appendChild(tr);
    }
  };

  const escapeHtml = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");

  const doFilter = () => {
    const q = (searchEl?.value || "").trim().toLowerCase();
    filtered = q ? rows.filter(r => cfg.columns.some(k => String(r[k] ?? "").toLowerCase().includes(q))) : rows.slice();
  };

  const doSort = () => {
    const key = sortEl?.value || cfg.columns[0];
    filtered.sort((a,b) => {
      // 置顶行优先
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      if (bPinned - aPinned !== 0) return bPinned - aPinned;

      const na = Number(a[key]), nb = Number(b[key]);
      const bothNum = !Number.isNaN(na) && !Number.isNaN(nb);
      if (bothNum) return na - nb;
      return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "zh-Hans");
    });
  };

  searchEl?.addEventListener("input", updateAndRender);
  sortEl?.addEventListener("change", updateAndRender);

  const ready = setInterval(() => { if (rows) { clearInterval(ready); updateAndRender(); } }, 50);
}
