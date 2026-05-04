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

(async () => {
  try {
    const res = await fetch('https://api.lanyard.rest/v1/users/288413771855298560');
    const { data } = await res.json();
    const dot = document.getElementById('discord-dot');
    const label = document.getElementById('discord-status-label');
    const nameEl = document.getElementById('discord-name');
    const avatar = document.getElementById('discord-avatar');
    const u = data.discord_user;
    dot.dataset.status = data.discord_status;
    const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
    label.textContent = (labels[data.discord_status] || 'Offline') + ' on Discord';
    nameEl.textContent = u.global_name || u.username;
    avatar.src = u.avatar
      ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const game = (data.activities || []).find(a => a.type === 0);
    if (game) {
      const actEl = document.getElementById('discord-activity');
      const actText = document.getElementById('discord-activity-text');
      actText.textContent = game.details ? `${game.name} — ${game.details}` : game.name;
      actEl.style.display = 'flex';
    }
  } catch (_) {}
})();
