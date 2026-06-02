import { switchMode } from './uiController.js';
import { gameState } from './gameState.js';
import { getRandomQuestion } from './questionEngine.js';
import { updateScore } from './scoreEngine.js';
import { renderScoreboard } from './utils.js';

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultArea = document.getElementById('result-area');
const teamInfo = document.getElementById('team-info');
const teamSelector = document.getElementById('team-selector');

const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');


// 渲染抢答队伍按钮
function renderTeamSelector(){

  teamSelector.innerHTML = '';

  // 只有抢答题显示
  if(gameState.mode !== 'buzzer'){
    return;
  }

  gameState.teams.forEach(team=>{

    const btn = document.createElement('button');

    btn.className = 'team-button';

    btn.innerText = team.name;

    // 高亮当前队伍
    if(gameState.selectedTeam === team.id){
      btn.classList.add('active');
    }

    btn.onclick = ()=>{

      gameState.selectedTeam = team.id;

      renderTeamSelector();

      teamInfo.innerText =
        `当前抢答队伍：${team.name}`;

    };

    teamSelector.appendChild(btn);

  });

}


// 渲染题目
function renderQuestion(){

  const question = getRandomQuestion(gameState.mode);

  gameState.currentQuestion = question;

  if(!question){
    questionText.innerText = '没有更多题目';
    return;
  }

  questionText.innerText = question.question;

  optionsContainer.innerHTML = '';

  gameState.selectedAnswers = [];

  question.options.forEach(option=>{

    const div = document.createElement('div');

    div.className = 'option';

    div.innerText = option;

    div.onclick = ()=>{

      // 单选
      if(question.type === 'single'){

        document
          .querySelectorAll('.option')
          .forEach(o=>o.classList.remove('selected'));

        div.classList.add('selected');

        gameState.selectedAnswers = [option];

      }

      // 多选
      else{

        div.classList.toggle('selected');

        if(gameState.selectedAnswers.includes(option)){

          gameState.selectedAnswers =
            gameState.selectedAnswers.filter(
              a=>a!==option
            );

        }else{

          gameState.selectedAnswers.push(option);

        }

      }

    };

    optionsContainer.appendChild(div);

  });

  // 渲染抢答队伍
  renderTeamSelector();

}


// 提交答案
submitBtn.onclick = ()=>{

  // 抢答题必须先选队伍
  if(
    gameState.mode === 'buzzer'
    &&
    !gameState.selectedTeam
  ){
    alert('请先选择抢到题的队伍');
    return;
  }

  const q = gameState.currentQuestion;

  if(!q){
    return;
  }

  const selected =
    [...gameState.selectedAnswers]
      .sort()
      .join(',');

  const answer =
    [...q.answer]
      .sort()
      .join(',');

  const isCorrect = selected === answer;

  // 默认队伍1
  let targetTeamId = 1;

  // 抢答题使用选择队伍
  if(gameState.mode === 'buzzer'){
    targetTeamId = gameState.selectedTeam;
  }

  // 正确
  if(isCorrect){

    resultArea.innerText = '回答正确！';

    updateScore(targetTeamId, 10);

  }

  // 错误
  else{

    resultArea.innerText =
      `回答错误！正确答案：${q.answer.join(',')}`;

    updateScore(targetTeamId, -10);

  }

  renderScoreboard();

};


// 下一题
nextBtn.onclick = ()=>{

  resultArea.innerText = '';

  // 清空抢答队伍
  gameState.selectedTeam = null;

  teamInfo.innerText = '';

  renderQuestion();

};


// 初始化
switchMode('home');

renderScoreboard();

window.startQuestion = renderQuestion;