import { gameState } from './gameState.js';

export function renderScoreboard() {
  const container = document.getElementById('scoreboard-list');

  // ===== 记录旧位置 =====
  const oldPositions = {};
  document.querySelectorAll('.score-item').forEach(item => {
    oldPositions[item.dataset.id] = item.getBoundingClientRect().top;
  });

  container.innerHTML = '';

  const sorted = [...gameState.teams].sort((a, b) => b.score - a.score);

  // ===== 找前三档分数 =====
  const scoreLevels = [...new Set(sorted.map(team => team.score).filter(score => score > 0))];
  const firstScore = scoreLevels[0];
  const secondScore = scoreLevels[1];
  const thirdScore = scoreLevels[2];

  sorted.forEach(team => {
    const item = document.createElement('div');
    item.className = 'score-item';
    item.dataset.id = team.id; // 唯一标识用于动画

    if (team.score > 0) {
      if (team.score === firstScore) item.classList.add('gold');
      else if (team.score === secondScore) item.classList.add('silver');
      else if (team.score === thirdScore) item.classList.add('bronze');
    }

    item.innerHTML = `
      <span>${team.name}</span>
      <span>${team.score}</span>
    `;

    container.appendChild(item);
  });

  // ===== 播放动画 =====
  document.querySelectorAll('.score-item').forEach(item => {
    const oldTop = oldPositions[item.dataset.id];
    if (oldTop === undefined) return;

    const newTop = item.getBoundingClientRect().top;
    const delta = oldTop - newTop;

    // 设置初始位置
    item.style.transition = 'none';
    item.style.transform = `translateY(${delta}px)`;

    // 触发下一帧动画
    requestAnimationFrame(() => {
      item.style.transition = 'transform 0.6s ease';
      item.style.transform = 'translateY(0)';
    });
  });
}