import { gameState } from './gameState.js';
import { renderScoreboard } from './utils.js';

const homePage = document.getElementById('home-page');
const questionPage = document.getElementById('question-page');

export function switchMode(mode){

  gameState.mode = mode;

  homePage.classList.remove('active');
  questionPage.classList.remove('active');

  if(mode === 'home'){
    homePage.classList.add('active');
  } else {
    questionPage.classList.add('active');
  }

  // 清理加赛题相关UI，防止污染其他模式
  const bonusMatchInfo = document.getElementById('bonus-match-info');
  if (bonusMatchInfo) bonusMatchInfo.style.display = 'none';
  const timerEl = document.getElementById('timer');
  if (timerEl) timerEl.style.display = 'block';

  const title = document.getElementById('mode-title');

  if(mode === 'answer'){
    title.innerText = '必答题';
  }

  if(mode === 'buzzer'){
    title.innerText = '抢答题';
  }

  if(mode === 'risk'){
    title.innerText = '风险题';
  }

  if(mode === 'bonus'){
    title.innerText = '加赛题';
  }

  renderScoreboard();
}

window.switchMode = switchMode;