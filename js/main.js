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
const riskSelector = document.getElementById('risk-selector');
const startContainer = document.getElementById('start-container');
const questionContainer = document.getElementById('question-container');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');

// ===== 防止重复提交 =====
let hasSubmitted = false;

// ===== 渲染抢答/风险队伍选择 =====
function renderTeamSelector() {
  teamSelector.innerHTML = '';
  if (gameState.mode === 'buzzer' || gameState.mode === 'risk') {
    gameState.teams.forEach(team => {
      const btn = document.createElement('button');
      btn.className = 'team-button';
      btn.innerText = team.name;
      if (gameState.selectedTeam === team.id) btn.classList.add('active');

      btn.onclick = () => {
        if (hasSubmitted) return;
        gameState.selectedTeam = team.id;
        renderTeamSelector();
        teamInfo.innerText = `当前${gameState.mode === 'buzzer' ? '抢答' : '风险'}队伍：${team.name}`;
      };

      teamSelector.appendChild(btn);
    });
  }
}

// ===== 风险题分值选择 =====
function renderRiskSelector() {
  riskSelector.innerHTML = '';
  if (gameState.mode !== 'risk') return;

  const riskLevels = Object.keys(gameState.riskQuestions);
  riskLevels.forEach(val => {
    const btn = document.createElement('button');
    btn.className = 'team-button';
    btn.innerText = `${val}分`;
    if (gameState.selectedRisk === parseInt(val)) btn.classList.add('active');

    btn.onclick = () => {
      if (hasSubmitted) return;
      if (!gameState.selectedTeam) {
        alert('请先选择队伍');
        return;
      }
      gameState.selectedRisk = parseInt(val);
      renderRiskSelector();
      renderQuestion();
    };

    riskSelector.appendChild(btn);
  });
}

// ===== 更新当前队伍信息 =====
function updateCurrentTeamInfo() {
  if (gameState.mode === 'answer') {
    const team = gameState.teams[gameState.currentAnswerTeam - 1];
    teamInfo.innerText = `当前队伍：${team.name} （第 ${team.answerCount + 1} / ${gameState.maxAnswerQuestions} 题）`;
  }
}

// ===== 渲染题目 =====
function renderQuestion() {
  hasSubmitted = false;
  submitBtn.disabled = false;

  if (gameState.mode === 'risk' && !gameState.selectedRisk) return;

  const question = getRandomQuestion(gameState.mode);
  gameState.currentQuestion = question;

  if (!question) {
    questionText.innerText = '没有更多题目';
    optionsContainer.innerHTML = '';
    return;
  }

  questionText.innerText = question.question;
  optionsContainer.innerHTML = '';
  resultArea.innerText = '';
  gameState.selectedAnswers = [];

  question.options.forEach(option => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerText = option;

    div.onclick = () => {
      if (hasSubmitted) return;

      if (question.type === 'single') {
        document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        div.classList.add('selected');
        gameState.selectedAnswers = [option];
      } else {
        div.classList.toggle('selected');
        if (gameState.selectedAnswers.includes(option)) {
          gameState.selectedAnswers = gameState.selectedAnswers.filter(a => a !== option);
        } else {
          gameState.selectedAnswers.push(option);
        }
      }
    };

    optionsContainer.appendChild(div);
  });

  renderTeamSelector();
  if (gameState.mode === 'risk') renderRiskSelector();
  updateCurrentTeamInfo();
}

// ===== 提交答案 =====
submitBtn.onclick = () => {
  if (hasSubmitted) return;

  const q = gameState.currentQuestion;
  if (!q) return;
  if (gameState.selectedAnswers.length === 0) {
    alert('请选择答案');
    return;
  }

  let targetTeamId = 1;
  if (gameState.mode === 'answer') targetTeamId = gameState.currentAnswerTeam;
  if (gameState.mode === 'buzzer') {
    if (!gameState.selectedTeam) { alert('请先选择抢答队伍'); return; }
    targetTeamId = gameState.selectedTeam;
  }
  if (gameState.mode === 'risk') {
    if (!gameState.selectedTeam) { alert('请先选择队伍'); return; }
    if (!gameState.selectedRisk) { alert('请先选择分值'); return; }
    targetTeamId = gameState.selectedTeam;
  }

  hasSubmitted = true;
  submitBtn.disabled = true;

  const selected = [...gameState.selectedAnswers].sort().join(',');
  const answer = [...q.answer].sort().join(',');
  const isCorrect = selected === answer;

  let points = gameState.mode === 'risk' ? gameState.selectedRisk : 10;
  if (isCorrect) {
    resultArea.innerText = `回答正确！ +${points}分`;
    updateScore(targetTeamId, points);
  } else {
    resultArea.innerText = `回答错误！正确答案：${q.answer.join(',')} 扣${points}分`;
    updateScore(targetTeamId, -points);
  }

  if (gameState.mode === 'answer') {
    gameState.teams[targetTeamId - 1].answerCount++;
  }

  renderScoreboard();
};

// ===== 下一题 =====
nextBtn.onclick = () => {
  hasSubmitted = false;
  submitBtn.disabled = false;
  resultArea.innerText = '';
  gameState.selectedAnswers = [];
  gameState.selectedTeam = null;
  gameState.selectedRisk = null;
  teamInfo.innerText = '';
  teamSelector.innerHTML = '';
  riskSelector.innerHTML = '';

  if (gameState.mode === 'answer') {
    const team = gameState.teams[gameState.currentAnswerTeam - 1];
    if (team.answerCount >= gameState.maxAnswerQuestions) {
      if (gameState.currentAnswerTeam < gameState.teams.length) {
        gameState.currentAnswerTeam++;
      } else {
        alert('必答题阶段结束！');
        switchMode('home');
        startContainer.style.display = 'block';
        questionContainer.style.display = 'none';
        return;
      }
    }
  }

  if (gameState.mode === 'risk') {
    questionText.innerText = '请选择队伍和分值';
    renderTeamSelector();
    renderRiskSelector();
    return;
  }

  renderQuestion();
};

// ===== 开始答题按钮 =====
startBtn.onclick = () => {
  startContainer.style.display = 'none';
  questionContainer.style.display = 'block';

  if (gameState.mode === 'risk') {
    questionText.innerText = '请选择队伍和分值';
    optionsContainer.innerHTML = '';
    renderTeamSelector();
    renderRiskSelector();
    return;
  }

  renderQuestion();
};

// ===== 页面初始化 =====
switchMode('home');
renderScoreboard();
startContainer.style.display = 'block';
questionContainer.style.display = 'none';

// ===== 切换模式时重置页面 =====
window.startQuestion = () => {
  startContainer.style.display = 'block';
  questionContainer.style.display = 'none';
  questionText.innerText = '';
  optionsContainer.innerHTML = '';
  resultArea.innerText = '';
  teamInfo.innerText = '';
  teamSelector.innerHTML = '';
  riskSelector.innerHTML = '';
  gameState.currentQuestion = null;
  gameState.selectedAnswers = [];
  gameState.selectedTeam = null;
  gameState.selectedRisk = null;
  hasSubmitted = false;
  submitBtn.disabled = false;

  if (gameState.mode === 'risk') {
    questionText.innerText = '请选择队伍和分值';
    renderTeamSelector();
    renderRiskSelector();
  }
};