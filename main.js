/**
 * Runtime behaviour: theme toggle, scroll animations, photo carousel,
 * live sidebar clock, and Discord presence via Lanyard WebSocket
 */

const root = document.documentElement;
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (stored !== 'light') {
  root.setAttribute('data-theme', 'dark');
}

// Wire all theme-toggle buttons (sidebar and mobile bar)
document.querySelectorAll('.theme-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
});

// On mobile the page scrolls on the body; use viewport as the observer root
const isMobile = () => window.innerWidth <= 768;
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, root: isMobile() ? null : document.querySelector('.op2-main') });

document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  obs.observe(el);
});

// Photo carousel with auto-advance and manual controls
(function () {
  const carousel = document.getElementById('photo-carousel');
  if (!carousel) {
    return;
  }
  const slides = carousel.querySelectorAll('.photo-slide');
  const dots = carousel.querySelectorAll('.photo-dot');
  const prev = carousel.querySelector('.photo-arrow--prev');
  const next = carousel.querySelector('.photo-arrow--next');
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    if (dots[current]) {
      dots[current].classList.remove('active');
    }
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) {
      dots[current].classList.add('active');
    }
  }

  function startAuto() {
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAuto() {
    clearInterval(timer);
    startAuto();
  }

  prev.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  next.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

  startAuto();
})();

// Left sidebar collapse toggle
(function () {
  const grid = document.querySelector('.op2-grid');
  const toggle = document.getElementById('op2-side-toggle');
  if (!grid || !toggle) {
    return;
  }
  let collapsed = false;

  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    grid.classList.toggle('side-collapsed', collapsed);
    toggle.setAttribute('aria-label', collapsed ? 'Expand left sidebar' : 'Collapse left sidebar');
  });
})();

// Right rail collapse toggle
(function () {
  const grid = document.querySelector('.op2-grid');
  const toggle = document.getElementById('op2-rail-toggle');
  if (!grid || !toggle) {
    return;
  }
  let collapsed = false;

  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    grid.classList.toggle('rail-collapsed', collapsed);
    toggle.setAttribute('aria-label', collapsed ? 'Expand right rail' : 'Collapse right rail');
  });
})();

// Section tracker — keeps left sidebar nav in sync with scroll position
(function () {
  const ORDER = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
  const main = document.querySelector('.op2-main');
  const visible = new Set();
  let clickLock = false;

  function setActive(id) {
    document.querySelectorAll('.op2-side-item[href]').forEach(link => {
      link.classList.toggle('on', link.getAttribute('href') === `#${id}`);
    });
  }

  // Always highlight the topmost visible section in ORDER, not whichever fired last
  function updateActive() {
    if (clickLock) {
      return;
    }
    const active = ORDER.find(id => visible.has(id));
    if (active) {
      setActive(active);
    }
  }

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        visible.add(e.target.id);
      }
      else {
        visible.delete(e.target.id);
      }
    });
    updateActive();
  }, {
    root: isMobile() ? null : main,
    threshold: 0.35,
  });

  // On click, immediately set active and lock the observer for the scroll duration
  document.querySelectorAll('.op2-side-item[href]').forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (!href.startsWith('#')) {
        return;
      }
      setActive(href.slice(1));
      clickLock = true;
      setTimeout(() => { clickLock = false; }, 900);
    });
  });

  ORDER.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      sectionObs.observe(el);
    }
  });
})();

/** Ticks the sidebar clock every 30 seconds */
function updateClock() {
  const el = document.getElementById('op2-clock');
  if (!el) {
    return;
  }
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[now.getMonth()];
  const y = String(now.getFullYear()).slice(2);
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${d} ${m} ${y} · ${h}:${min}`;
}
updateClock();
setInterval(updateClock, 30000);

/**
 * Connects to the Lanyard WebSocket and keeps the Discord presence card
 * updated in real time. Reconnects automatically on disconnect.
 */
(() => {
  const USER_ID = '288413771855298560';
  const labels = { online: 'online', idle: 'idle', dnd: 'do not disturb', offline: 'offline' };
  let heartbeatTimer = null;

  // Update the DOM from a Lanyard presence data object
  function applyPresence(data) {
    const dot = document.getElementById('discord-dot');
    const label = document.getElementById('discord-status-label');
    const nameEl = document.getElementById('discord-name');
    const avatar = document.getElementById('discord-avatar');
    const actEl = document.getElementById('discord-activity');
    const actText = document.getElementById('discord-activity-text');
    const u = data.discord_user;

    dot.dataset.status = data.discord_status;
    label.textContent = (labels[data.discord_status] || 'offline') + ' on Discord';
    nameEl.textContent = u.global_name || u.username;

    if (u.avatar) {
      avatar.src = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`;
      avatar.style.display = 'block';
    }

    const game = (data.activities || []).find(a => a.type === 0);
    if (game) {
      actText.textContent = game.details ? `${game.name} — ${game.details}` : game.name;
      actEl.style.display = 'flex';
    }
    else {
      actEl.style.display = 'none';
    }
  }

  function connect() {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.addEventListener('message', (event) => {
      const { op, d, t } = JSON.parse(event.data);

      // HELLO — start heartbeat and subscribe
      if (op === 1) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => ws.send(JSON.stringify({ op: 3 })), d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: USER_ID } }));
      }
      // EVENT — INIT_STATE or PRESENCE_UPDATE
      else if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
        applyPresence(d);
      }
    });

    ws.addEventListener('close', () => {
      clearInterval(heartbeatTimer);
      // Reconnect after a short delay
      setTimeout(connect, 5000);
    });

    ws.addEventListener('error', () => ws.close());
  }

  connect();
})();

// 3D tilt on hover — project cards and experience items track the cursor in perspective
(function () {
  document.querySelectorAll('.project-card, .exp-item, .op2-stat').forEach(card => {
    let leaveTimer = null;

    card.addEventListener('mousemove', e => {
      clearTimeout(leaveTimer);
      leaveTimer = null;
      card.style.transition = '';
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 2;
      const y = ((e.clientY - top)  / height - 0.5) * 2;
      const deg = card.classList.contains('op2-stat') ? 5 : 7;
      card.style.transform = `perspective(700px) rotateY(${x * deg}deg) rotateX(${-y * deg}deg) translateZ(5px)`;
      card.style.boxShadow = `${-x * 10}px ${y * 10}px 24px rgba(59,130,246,0.12)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.5s ease';
      card.style.transform  = '';
      card.style.boxShadow  = '';
      leaveTimer = setTimeout(() => {
        card.style.transition = '';
        leaveTimer = null;
      }, 500);
    });
  });
})();
