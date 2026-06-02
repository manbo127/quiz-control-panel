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
  }else{
    questionPage.classList.add('active');
  }

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

  renderScoreboard();
}

window.switchMode = switchMode;
