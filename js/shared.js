/* ═══════════════════════════════════════════════════════
   SpecHub — shared.js  v2.0  (static / GitHub Pages)
   Clean directory URLs only. No .html anywhere.
═══════════════════════════════════════════════════════ */

/* ── SITE BASE PATH (auto-detected) ──
   Works correctly whether the site is served from:
   - a GitHub Pages project subdirectory (https://user.github.io/repo/)
   - a custom domain root (https://spechubpro.com/)
   - local dev server
   Derived from this script's own resolved <script src> location,
   so it always matches wherever the site actually lives. */
const SITE_BASE = (function () {
  var s = document.currentScript;
  if (s && s.src) {
    return s.src.replace(/\/js\/shared\.js.*$/, '');
  }
  return '';
})();

/* ── THEME (runs immediately to prevent flash) ── */
(function () {
  if (localStorage.getItem('spechub_theme') === 'dark')
    document.documentElement.setAttribute('data-theme', 'dark');
})();

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('spechub_theme', isDark ? 'light' : 'dark');
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  icon.innerHTML = isDark
    ? '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/>'
    : '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
}

document.addEventListener('DOMContentLoaded', updateThemeIcon);

/* ── MOBILE NAV ── */
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('navOverlay');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileNav() {
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('navOverlay');
  if (nav) nav.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── LIVE SEARCH DROPDOWN ── */
function liveSearch(q, dropId) {
  const drop = document.getElementById(dropId || 'searchDropdown');
  if (!drop) return;
  if (!q || q.length < 2) { drop.style.display = 'none'; return; }
  if (typeof PHONE_DB === 'undefined') return;

  const results = PHONE_DB.phones
    .filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase())
    )
    .slice(0, 7);

  if (!results.length) { drop.style.display = 'none'; return; }

  // NOTE: Clean slash URLs — /phones/{id}/ — no .html
  drop.innerHTML = results.map(p => `
    <a href="${SITE_BASE}/phones/${p.id}/" class="search-drop-item" style="text-decoration:none;color:inherit">
      <div class="search-drop-thumb">
        <img src="${resolveImg(p.image)}" alt="${p.name}"
          onerror="this.parentElement.innerHTML='<i class=\'fas fa-mobile-alt\' style=\'color:var(--text3)\'></i>'">
      </div>
      <div>
        <div class="search-drop-name">${p.name}</div>
        <div class="search-drop-meta">${p.brand} &middot; ${p.price}</div>
      </div>
    </a>`).join('');

  drop.style.display = 'block';
}

/* Close dropdowns on outside click */
document.addEventListener('click', e => {
  const drop = document.getElementById('searchDropdown');
  if (drop && !e.target.closest('.nav-search') && !e.target.closest('.hero-search'))
    drop.style.display = 'none';
  const heroDrop = document.getElementById('heroDropdown');
  if (heroDrop && !e.target.closest('.hero-search'))
    heroDrop.style.display = 'none';
});

/* Go to search page — clean URL */
function goSearch() {
  const input = document.getElementById('heroSearch') ||
                document.getElementById('navSearch') ||
                document.querySelector('.mobile-nav-search input');
  const q = input ? input.value.trim() : '';
  window.location.href = SITE_BASE + '/search/' + (q ? '?q=' + encodeURIComponent(q) : '');
}

/* ── TOAST ── */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── FAQ ACCORDION ── */
function toggleFaq(el) {
  const ans  = el.nextElementSibling;
  const icon = el.querySelector('i');
  const isOpen = ans.classList.contains('open');

  /* Close all open items */
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    a.previousElementSibling.classList.remove('open');
    const i = a.previousElementSibling.querySelector('i');
    if (i) i.style.transform = '';
  });

  if (!isOpen) {
    ans.classList.add('open');
    el.classList.add('open');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

/* ── COMPARE FLOATING BAR ── */
let compareList = [];
try {
  compareList = JSON.parse(localStorage.getItem('spechub_compare') || '[]');
} catch (e) { compareList = []; }

function _saveCompare() {
  localStorage.setItem('spechub_compare', JSON.stringify(compareList));
}

function toggleCompare(id, name, btn) {
  const idx = compareList.indexOf(id);
  if (idx >= 0) {
    compareList.splice(idx, 1);
    if (btn) btn.classList.remove('active');
    showToast('Removed from compare');
  } else {
    if (compareList.length >= 4) { showToast('Max 4 phones in compare'); return; }
    compareList.push(id);
    if (btn) btn.classList.add('active');
    showToast('Added to compare');
  }
  _saveCompare();
  updateCompareBar();
}

function removeFromCompare(id) {
  compareList = compareList.filter(c => c !== id);
  _saveCompare();
  updateCompareBar();
  const btn = document.querySelector('[data-compare-id="' + id + '"]');
  if (btn) btn.classList.remove('active');
}

function clearCompare() {
  compareList = [];
  _saveCompare();
  updateCompareBar();
  document.querySelectorAll('.compare-toggle.active').forEach(b => b.classList.remove('active'));
}

function updateCompareBar() {
  const bar      = document.getElementById('compareBar');
  const phonesEl = document.getElementById('comparePhones');
  if (!bar || !phonesEl) return;

  if (compareList.length === 0) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');

  if (typeof PHONE_DB === 'undefined') return;
  phonesEl.innerHTML = compareList.map(id => {
    const p = PHONE_DB.phones.find(x => x.id === id);
    if (!p) return '';
    return `<div class="compare-phone-chip">
      <img src="${resolveImg(p.image)}" alt="${p.name}" onerror="this.style.display='none'">
      <span>${p.name}</span>
      <button onclick="removeFromCompare('${p.id}')" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    </div>`;
  }).join('');

  /* Sync button states */
  document.querySelectorAll('.compare-toggle').forEach(btn => {
    const id = btn.dataset.compareId;
    if (id) btn.classList.toggle('active', compareList.includes(id));
  });
}

/* Navigate to compare page — clean URL, pass IDs as query param */
function goCompare() {
  if (compareList.length < 2) { showToast('Select at least 2 phones first'); return; }
  window.location.href = SITE_BASE + '/compare/?phones=' + compareList.join(',');
}

/* ── UTILITIES ── */
function resolveImg(src) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return SITE_BASE + '/' + src.replace(/^\//, '');
}

function sharePhone(name) {
  if (navigator.share) {
    navigator.share({ title: name + ' Specs – SpecHub', url: window.location.href })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast('Link copied!'))
      .catch(() => showToast('Copy: ' + window.location.href));
  }
}

function submitContact(e) {
  if (e) e.preventDefault();
  showToast('Message sent! We will reply within 24 hours.');
  const form = document.getElementById('contactForm');
  if (form) form.reset();
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMobileNav();
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── INIT ON DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCompareBar();

  /* Mark active nav link — works with clean slash URLs.
     Uses the browser-resolved a.pathname (not the raw href attribute)
     so it works correctly whether hrefs are relative or absolute. */
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    const href = (a.pathname || '').replace(/\/$/, '') || '/';
    if (href === '/' ? path === '/' : (path === href || path.startsWith(href + '/'))) {
      a.classList.add('active');
    }
  });

  /* Restore compare toggle states */
  document.querySelectorAll('.compare-toggle').forEach(btn => {
    const id = btn.dataset.compareId;
    if (id && compareList.includes(id)) btn.classList.add('active');
  });
});
