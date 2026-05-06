const root = document.documentElement;
const btn = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (stored === 'dark' || (!stored && prefersDark)) {
  root.setAttribute('data-theme', 'dark');
}

btn.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

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
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
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

/**
 * Connects to the Lanyard WebSocket and keeps the Discord presence card
 * updated in real time. Reconnects automatically on disconnect.
 */
(() => {
  const USER_ID = '288413771855298560';
  const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
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
    label.textContent = (labels[data.discord_status] || 'Offline') + ' on Discord';
    nameEl.textContent = u.global_name || u.username;
    avatar.src = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

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
