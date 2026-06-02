import { switchMode } from './uiController.js';
import { gameState } from './gameState.js';
import { getRandomQuestion } from './questionEngine.js';
import { updateScore } from './scoreEngine.js';
import { renderScoreboard } from './utils.js';

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultArea = document.getElementById('result-area');
const teamInfo = document.getElementById('team-info');

const teamSelector =
  document.getElementById('team-selector');

const riskSelector =
  document.getElementById('risk-selector');

const submitBtn =
  document.getElementById('submit-btn');

const nextBtn =
  document.getElementById('next-btn');


// =============================
// 抢答题队伍选择
// =============================
function renderTeamSelector(){

  teamSelector.innerHTML = '';

  // 抢答题
  if(gameState.mode === 'buzzer'){

    gameState.teams.forEach(team=>{

      const btn =
        document.createElement('button');

      btn.className = 'team-button';

      btn.innerText = team.name;

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

  // 风险题
  if(gameState.mode === 'risk'){

    gameState.teams.forEach(team=>{

      const btn =
        document.createElement('button');

      btn.className = 'team-button';

      btn.innerText = team.name;

      if(gameState.selectedTeam === team.id){
        btn.classList.add('active');
      }

      btn.onclick = ()=>{

        gameState.selectedTeam = team.id;

        renderTeamSelector();

        teamInfo.innerText =
          `当前风险队伍：${team.name}`;

      };

      teamSelector.appendChild(btn);

    });

  }

}


// =============================
// 风险题分值选择
// =============================
function renderRiskSelector(){

  riskSelector.innerHTML = '';

  if(gameState.mode !== 'risk'){
    return;
  }

  const riskLevels =
    Object.keys(gameState.riskQuestions);

  riskLevels.forEach(val=>{

    const btn =
      document.createElement('button');

    btn.className = 'team-button';

    btn.innerText = `${val}分`;

    if(gameState.selectedRisk === parseInt(val)){
      btn.classList.add('active');
    }

    btn.onclick = ()=>{

      // 必须先选队伍
      if(!gameState.selectedTeam){

        alert('请先选择队伍');

        return;
      }

      gameState.selectedRisk =
        parseInt(val);

      renderRiskSelector();

      // 自动显示题目
      renderQuestion();

    };

    riskSelector.appendChild(btn);

  });

}


// =============================
// 更新当前队伍显示
// =============================
function updateCurrentTeamInfo(){

  // 必答题
  if(gameState.mode === 'answer'){

    const team =
      gameState.teams[
        gameState.currentAnswerTeam - 1
      ];

    teamInfo.innerText =
      `当前队伍：${team.name}
      （第 ${team.answerCount + 1}
      / ${gameState.maxAnswerQuestions} 题）`;

  }

}


// =============================
// 渲染题目
// =============================
function renderQuestion(){

  // 风险题必须先选择分值
  if(
    gameState.mode === 'risk'
    &&
    !gameState.selectedRisk
  ){
    return;
  }

  const question =
    getRandomQuestion(gameState.mode);

  gameState.currentQuestion = question;

  // 没题了
  if(!question){

    questionText.innerText =
      '没有更多题目';

    optionsContainer.innerHTML = '';

    return;
  }

  questionText.innerText =
    question.question;

  optionsContainer.innerHTML = '';

  resultArea.innerText = '';

  gameState.selectedAnswers = [];

  question.options.forEach(option=>{

    const div =
      document.createElement('div');

    div.className = 'option';

    div.innerText = option;

    div.onclick = ()=>{

      // 单选
      if(question.type === 'single'){

        document
          .querySelectorAll('.option')
          .forEach(o=>
            o.classList.remove('selected')
          );

        div.classList.add('selected');

        gameState.selectedAnswers = [option];

      }

      // 多选
      else{

        div.classList.toggle('selected');

        if(
          gameState.selectedAnswers
            .includes(option)
        ){

          gameState.selectedAnswers =
            gameState.selectedAnswers
              .filter(a=>a!==option);

        }

        else{

          gameState.selectedAnswers
            .push(option);

        }

      }

    };

    optionsContainer.appendChild(div);

  });

  renderTeamSelector();

  // 避免风险题无限循环
  if(gameState.mode !== 'risk'){
    renderRiskSelector();
  }

  updateCurrentTeamInfo();

}


// =============================
// 提交答案
// =============================
submitBtn.onclick = ()=>{

  const q =
    gameState.currentQuestion;

  if(!q){
    return;
  }

  // 没选答案
  if(
    gameState.selectedAnswers.length === 0
  ){
    alert('请选择答案');
    return;
  }

  let targetTeamId = 1;

  // =========================
  // 必答题
  // =========================
  if(gameState.mode === 'answer'){

    targetTeamId =
      gameState.currentAnswerTeam;

  }

  // =========================
  // 抢答题
  // =========================
  if(gameState.mode === 'buzzer'){

    if(!gameState.selectedTeam){

      alert('请先选择抢答队伍');

      return;
    }

    targetTeamId =
      gameState.selectedTeam;

  }

  // =========================
  // 风险题
  // =========================
  if(gameState.mode === 'risk'){

    if(!gameState.selectedTeam){

      alert('请先选择队伍');

      return;
    }

    if(!gameState.selectedRisk){

      alert('请先选择分值');

      return;
    }

    targetTeamId =
      gameState.selectedTeam;

  }

  // =========================
  // 判题
  // =========================
  const selected =
    [...gameState.selectedAnswers]
      .sort()
      .join(',');

  const answer =
    [...q.answer]
      .sort()
      .join(',');

  const isCorrect =
    selected === answer;

  // 分值
  let points = 10;

  // 风险题使用对应分值
  if(gameState.mode === 'risk'){
    points = gameState.selectedRisk;
  }

  // 正确
  if(isCorrect){

    resultArea.innerText =
      `回答正确！ +${points}分`;

    updateScore(
      targetTeamId,
      points
    );

  }

  // 错误
  else{

    resultArea.innerText =
      `回答错误！
      正确答案：${q.answer.join(',')}
      扣 ${points} 分`;

    updateScore(
      targetTeamId,
      -points
    );

  }

  // =========================
  // 必答题计数
  // =========================
  if(gameState.mode === 'answer'){

    gameState.teams[
      targetTeamId - 1
    ].answerCount++;

  }

  renderScoreboard();

};


// =============================
// 下一题
// =============================
nextBtn.onclick = ()=>{

  resultArea.innerText = '';

  // =========================
  // 必答题轮换
  // =========================
  if(gameState.mode === 'answer'){

    const team =
      gameState.teams[
        gameState.currentAnswerTeam - 1
      ];

    // 当前队伍答满5题
    if(
      team.answerCount >=
      gameState.maxAnswerQuestions
    ){

      // 切换下一队
      if(
        gameState.currentAnswerTeam <
        gameState.teams.length
      ){

        gameState.currentAnswerTeam++;

      }

      // 所有队伍结束
      else{

        alert('必答题阶段结束！');

        switchMode('home');

        return;

      }

    }

  }

  // =========================
  // 清空状态
  // =========================
  gameState.selectedAnswers = [];

  gameState.selectedTeam = null;

  gameState.selectedRisk = null;

  teamInfo.innerText = '';

  // 风险题重新选择
  if(gameState.mode === 'risk'){

    questionText.innerText =
      '请选择队伍和分值';

    optionsContainer.innerHTML = '';

    renderTeamSelector();

    renderRiskSelector();

    return;

  }

  renderQuestion();

};


// =============================
// 页面初始化
// =============================
switchMode('home');

renderScoreboard();


// =============================
// 全局启动函数
// =============================
window.startQuestion = ()=>{

  // 必答题
  if(gameState.mode === 'answer'){

    renderQuestion();

  }

  // 抢答题
  if(gameState.mode === 'buzzer'){

    renderQuestion();

  }

  // 风险题
  if(gameState.mode === 'risk'){

    questionText.innerText =
      '请选择队伍和分值';

    optionsContainer.innerHTML = '';

    renderTeamSelector();

    renderRiskSelector();

  }

};