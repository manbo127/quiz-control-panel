import { gameState } from './gameState.js';

export function renderScoreboard(){

  const container = document.getElementById('scoreboard-list');

  container.innerHTML = '';

  const sorted = [...gameState.teams].sort((a,b)=>b.score-a.score);

  sorted.forEach(team=>{

    const item = document.createElement('div');

    item.className = 'score-item';

    item.innerHTML = `
      <span>${team.name}</span>
      <span>${team.score}</span>
    `;

    container.appendChild(item);

  });

}
