// 轻量工具：加载 JSON，渲染表格，提供搜索 & 简单排序
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
      render();
    })
    .catch(() => {
      rows = []; filtered = [];
      render();
    });

  const render = () => {
    tbody.innerHTML = "";
    if (!filtered.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    for (const r of filtered) {
      const tr = document.createElement("tr");
      tr.innerHTML = cfg.columns.map(k => `<td>${escapeHtml(r[k] ?? "")}</td>`).join("");
      tbody.appendChild(tr);
    }
  };

  const escapeHtml = (s) => String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");

  const doFilter = () => {
    const q = (searchEl?.value || "").trim().toLowerCase();
    if (!q) { filtered = rows.slice(); return; }
    filtered = rows.filter(r =>
      cfg.columns.some(k => String(r[k] ?? "").toLowerCase().includes(q))
    );
  };

  const doSort = () => {
    const key = sortEl?.value || cfg.columns[0];
    filtered.sort((a,b) => {
      const va = a[key]; const vb = b[key];
      const na = Number(va), nb = Number(vb);
      const bothNum = !Number.isNaN(na) && !Number.isNaN(nb);
      if (bothNum) return na - nb;
      return String(va ?? "").localeCompare(String(vb ?? ""), "zh-Hans");
    });
  };

  searchEl?.addEventListener("input", () => { doFilter(); doSort(); render(); });
  sortEl?.addEventListener("change", () => { doFilter(); doSort(); render(); });

  // 初始排序渲染
  const ready = setInterval(() => {
    if (rows) {
      clearInterval(ready);
      doFilter(); doSort(); render();
    }
  }, 50);
}
