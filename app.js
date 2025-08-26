// app.js - 支持置顶货架、搜索、排序
function bootTable(cfg) {
  const tbody = document.querySelector(cfg.tbody);
  const empty = document.querySelector(cfg.empty);
  const searchEl = document.querySelector(cfg.searchInput);
  const sortEl = document.querySelector(cfg.sortSelect);

  let rows = [];
  let filtered = [];

  // 加载 JSON 数据
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

  // 更新过滤 + 排序 + 渲染
  const updateAndRender = () => {
    doFilter();
    doSort();
    render();
  };

  // 渲染表格
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

  // HTML 转义
  const escapeHtml = (s) => String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");

  // 搜索过滤
  const doFilter = () => {
    const q = (searchEl?.value || "").trim().toLowerCase();
    if (!q) {
      filtered = rows.slice();
      return;
    }
    filtered = rows.filter(r =>
      cfg.columns.some(k => String(r[k] ?? "").toLowerCase().includes(q))
    );
  };

  // 排序
  const doSort = () => {
    const key = sortEl?.value || cfg.columns[0];
    filtered.sort((a,b) => {
      // 置顶优先
      const aPinned = a.pinned ? 1 : 0;
      const bPinned = b.pinned ? 1 : 0;
      if (bPinned - aPinned !== 0) return bPinned - aPinned;

      // 数值排序优先
      const na = Number(a[key]);
      const nb = Number(b[key]);
      const bothNum = !Number.isNaN(na) && !Number.isNaN(nb);
      if (bothNum) return na - nb;

      // 文字排序
      return String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "zh-Hans");
    });
  };

  // 事件监听
  searchEl?.addEventListener("input", updateAndRender);
  sortEl?.addEventListener("change", updateAndRender);

  // 初始渲染
  const ready = setInterval(() => {
    if (rows) {
      clearInterval(ready);
      updateAndRender();
    }
  }, 50);
}
