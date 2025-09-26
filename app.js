// app.js — простая логика: меню, XP-система, lazy loading (если есть видео iframe)
document.addEventListener('DOMContentLoaded', () => {
  // header mobile toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.main-nav').classList.toggle('open');
    });
  }

  // year in footer index
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = y;

  // Ranks / XP logic (работает если есть элементы на странице ranks.html)
  const rankConfig = [
    {name: 'Новичок', xp: 0},
    {name: 'Прорыв', xp: 100},
    {name: 'Громовой мастер', xp: 350},
    {name: 'Хранитель Разряда', xp: 900}
  ];

  const playerNameInput = document.getElementById('player-name');
  const xpEls = {
    xp: document.getElementById('xp'),
    xpGoal: document.getElementById('xp-goal'),
    level: document.getElementById('level'),
    rankName: document.getElementById('rank-name'),
    progressBar: document.getElementById('progress-bar'),
    rankListUl: document.getElementById('rank-list-ul')
  };

  function loadState() {
    const raw = localStorage.getItem('thunder_state');
    if (raw) return JSON.parse(raw);
    return {name: '', xp: 0};
  }
  function saveState(state) {
    localStorage.setItem('thunder_state', JSON.stringify(state));
  }
  function calcRank(xp) {
    // возвращаем текущий ранг индекс и XP до следующего
    let current = rankConfig[0];
    for (let i = rankConfig.length-1; i >=0; i--){
      if (xp >= rankConfig[i].xp) { current = rankConfig[i]; break; }
    }
    // next goal
    const next = rankConfig.find(r => r.xp > xp) || null;
    return {current, next};
  }

  function renderRanksList() {
    if (!xpEls.rankListUl) return;
    xpEls.rankListUl.innerHTML = '';
    rankConfig.forEach(r => {
      const li = document.createElement('li');
      li.textContent = ${r.name} — ${r.xp} XP;
      xpEls.rankListUl.appendChild(li);
    });
  }

  if (xpEls.rankListUl) renderRanksList();

  let state = loadState();
  if (playerNameInput && state.name) playerNameInput.value = state.name;

  function updateUI() {
    if (!xpEls.xp) return;
    const xp = state.xp || 0;
    const {current, next} = calcRank(xp);
    xpEls.xp.textContent = xp;
    xpEls.rankName.textContent = current.name;
    // level simple: level = index+1
    const level = rankConfig.findIndex(r => r.name === current.name) + 1;
    xpEls.level.textContent = level;
    const goal = next ? next.xp : (current.xp + 200);
    xpEls.xpGoal.textContent = goal;
    // percent
    const range = goal - current.xp;
    const percent = Math.min(100, Math.round(((xp - current.xp) / range) * 100));
    xpEls.progressBar.style.width = percent + '%';
  }

  updateUI();

  // XP buttons
  document.querySelectorAll('[data-xp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const add = parseInt(btn.getAttribute('data-xp') || '0', 10);
      state.xp = (state.xp || 0) + add;
      saveState(state);
      updateUI();
    });
  });

  const reset = document.getElementById('reset');
  if (reset) {
    reset.addEventListener('click', () => {
      if (!confirm('Сбросить прогресс?')) return;
      state = {name: '', xp: 0};
      saveState(state);
      if (playerNameInput) playerNameInput.value = '';
      updateUI();
    });
  }

  if (playerNameInput) {
    playerNameInput.addEventListener('input', () => {
      state.name = playerNameInput.value;
      saveState(state);
    });
  }

  // Lazy load YouTube iframes to improve perf
  const iframes = document.querySelectorAll('iframe[data-src]');
  iframes.forEach(iframe => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          iframe.src = iframe.dataset.src;
          io.disconnect();
        }
      });
    });
    io.observe(iframe);
  });
});
