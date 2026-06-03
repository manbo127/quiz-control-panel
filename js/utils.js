import { gameState } from './gameState.js';

export function renderScoreboard() {

  const container =
    document.getElementById('scoreboard-list');

  container.innerHTML = '';

  const sorted =
    [...gameState.teams]
      .sort((a, b) => b.score - a.score);

  // ===== 找前三档分数 =====

  const scoreLevels =
    [...new Set(
      sorted
        .map(team => team.score)
        .filter(score => score > 0)
    )];

  const firstScore = scoreLevels[0];
  const secondScore = scoreLevels[1];
  const thirdScore = scoreLevels[2];

  sorted.forEach(team => {

    const item =
      document.createElement('div');

    item.className = 'score-item';

    if (team.score > 0) {

      if (team.score === firstScore) {

        item.classList.add('gold');

      } else if (
        team.score === secondScore
      ) {

        item.classList.add('silver');

      } else if (
        team.score === thirdScore
      ) {

        item.classList.add('bronze');
      }
    }

    item.innerHTML = `
      <span>${team.name}</span>
      <span>${team.score}</span>
    `;

    container.appendChild(item);

  });

}