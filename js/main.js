import { switchMode } from './uiController.js';
import { gameState } from './gameState.js';
import { getRandomQuestion } from './questionEngine.js';
import { updateScore } from './scoreEngine.js';
import { renderScoreboard } from './utils.js';

// ===== 登录验证 =====
(function initLogin() {
  const overlay = document.getElementById('login-overlay');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-btn');
  const loginError = document.getElementById('login-error');

  // 已登录则跳过
  if (sessionStorage.getItem('loggedIn') === 'true') {
    overlay.classList.add('hidden');
    return;
  }

  // 显示登录界面
  overlay.classList.remove('hidden');

  // 回车键登录
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === 'manbo' && password === '12312345') {
      sessionStorage.setItem('loggedIn', 'true');
      overlay.classList.add('hidden');
      loginError.textContent = '';
    } else {
      loginError.textContent = '用户名或密码错误，请重新输入';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
})();

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultArea = document.getElementById('result-area');
const teamInfo = document.getElementById('team-info');
const teamSelector = document.getElementById('team-selector');
const riskSelector = document.getElementById('risk-selector');
const timerElement = document.getElementById('timer');
const remainingCount = document.getElementById('remaining-count');

const startContainer = document.getElementById('start-container');
const questionContainer = document.getElementById('question-container');

const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const endAnswerBtn = document.getElementById('end-answer-btn');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const bonusMatchInfo = document.getElementById('bonus-match-info');
const bonusTeamA = document.getElementById('bonus-team-a');
const bonusTeamB = document.getElementById('bonus-team-b');

let hasSubmitted = false;
let currentRiskTeam = 1;
let currentRiskPoints = 0;
let timer = null;
let timeLeft = 0;

// ===== 加赛题状态 =====
let bonusQueue = [];
let currentBonusPair = [];

// ===== 开始倒计时 =====
function startTimer(seconds) {
  clearInterval(timer);
  timeLeft = seconds;
  timerElement.classList.remove('warning');
  timerElement.innerText = `剩余时间：${timeLeft} 秒`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.innerText = `剩余时间：${timeLeft} 秒`;

    // 最后5秒视觉警告
    if (timeLeft <= 5 && timeLeft > 0) {
      timerElement.classList.add('warning');
    } else {
      timerElement.classList.remove('warning');
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      timerElement.classList.remove('warning');
      timerElement.innerText = '时间到！';
      if (hasSubmitted) return;
      hasSubmitted = true;
      submitBtn.disabled = true;

      if (gameState.mode === 'answer') {
        resultArea.innerText = '超时！本题作答失败';
        gameState.teams[gameState.currentAnswerTeam - 1].answerCount++;
      } else if (gameState.mode === 'buzzer') {
        if (gameState.selectedTeam) {
          resultArea.innerText = '超时！抢答失败，另一队获胜';
          const winner = gameState.teams.find(t => t.id !== gameState.selectedTeam);
          updateScore(winner.id, 10);
          renderScoreboard();
        }
      } else if (gameState.mode === 'risk') {
        resultArea.innerText = `超时！ -${currentRiskPoints}分`;
        updateScore(currentRiskTeam, -currentRiskPoints);
        renderScoreboard();
        endAnswerBtn.style.display = 'none';
        correctBtn.style.display = 'none';
        wrongBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
      } else if (gameState.mode === 'bonus') {

        // 没有人点击队伍
        if (!gameState.selectedTeam) {

          resultArea.innerText =
            '超时！无人抢答';

          return;

        }

        const winner = currentBonusPair.find(
          t => t.id !== gameState.selectedTeam
        );

        updateScore(winner.id, 5);

        resultArea.innerText =
          `超时！${winner.name} 获胜 +5分`;

        renderScoreboard();
      }
    }
  }, 1000);
}

// ===== 停止倒计时 =====
function stopTimer() {
  clearInterval(timer);
  timerElement.classList.remove('warning');
  timerElement.innerText = '';
}

// ===== 更新当前队伍信息 =====
function updateCurrentTeamInfo() {
  if (gameState.mode === 'answer') {
    const team = gameState.teams[gameState.currentAnswerTeam - 1];
    teamInfo.innerText = `当前队伍：${team.name} （第 ${team.answerCount + 1} / ${gameState.maxAnswerQuestions} 题）`;
  } else if (gameState.mode === 'buzzer') {
    if (gameState.selectedTeam) {
      const team = gameState.teams[gameState.selectedTeam - 1];
      teamInfo.innerText = `当前抢答队伍：${team.name}`;
    } else {
      teamInfo.innerText = '请选择抢答队伍';
    }
  } else if (gameState.mode === 'risk') {
    const team = gameState.teams[currentRiskTeam - 1];
    teamInfo.innerText = `⚡ 风险题 · ${team.name}`;
  } else if (gameState.mode === 'bonus') {
    teamInfo.innerText = `加赛题：${currentBonusPair[0].name} vs ${currentBonusPair[1].name}`;
  }
}

// ===== 更新抢答题剩余题数 =====
function updateRemainingCount() {
  if (gameState.mode === 'buzzer') {
    const remaining = gameState.buzzerQuestions.filter(q => !q.used).length;
    remainingCount.innerText = `剩余题目：${remaining} / ${gameState.buzzerQuestions.length}`;
    remainingCount.style.display = '';
  } else {
    remainingCount.style.display = 'none';
  }
}

// ===== 渲染抢答队伍 =====
function renderTeamSelector() {
  teamSelector.innerHTML = '';
  if (gameState.mode !== 'buzzer') return;
  gameState.teams.forEach(team => {
    const btn = document.createElement('button');
    btn.className = 'team-button';
    btn.innerText = team.name;
    if (gameState.selectedTeam === team.id) btn.classList.add('active');
    btn.onclick = () => {
      gameState.selectedTeam = team.id;
      renderTeamSelector();
      updateCurrentTeamInfo();
      startTimer(30);
    };
    teamSelector.appendChild(btn);
  });
}

// ===== 渲染风险题分值 =====
function renderRiskSelector() {
  riskSelector.innerHTML = '';
  if (gameState.mode !== 'risk') return;

  const scoreConfigs = [
    { score: 20, cssClass: 'risk-score-20', label: '低风险' },
    { score: 30, cssClass: 'risk-score-30', label: '中风险' },
    { score: 40, cssClass: 'risk-score-40', label: '高风险' },
  ];

  scoreConfigs.forEach(({ score, cssClass, label }) => {
    const btn = document.createElement('button');
    btn.className = `risk-score-btn ${cssClass}`;
    btn.innerHTML = `<span class="score-value">${score}</span><span class="score-label">分 · ${label}</span>`;
    btn.onclick = () => {
      currentRiskPoints = score;
      gameState.selectedRisk = score;
      const question = getRandomQuestion('risk');
      gameState.currentQuestion = question;
      if (!question) { questionText.innerText = '该分值暂无题目'; return; }
      questionText.innerText = question.question;
      optionsContainer.innerHTML = '';
      resultArea.innerText = '';
      submitBtn.style.display = 'none';
      endAnswerBtn.style.display = 'inline-block';
      correctBtn.style.display = 'none';
      wrongBtn.style.display = 'none';
      startTimer(60);
      // 只保留选中的分值档位，隐藏其余
      document.querySelectorAll('.risk-score-btn').forEach(b => {
        b.style.display = 'none';
      });
      btn.style.display = '';
      btn.classList.add('selected');
    };
    riskSelector.appendChild(btn);
  });
}

// ===== 渲染普通题 =====
function renderQuestion() {
  hasSubmitted = false;
  submitBtn.disabled = false;
  const question = getRandomQuestion(gameState.mode);
  gameState.currentQuestion = question;
  if (!question) { questionText.innerText = '没有更多题目'; optionsContainer.innerHTML = ''; return; }
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
        gameState.selectedAnswers = [option.charAt(0)];
      } else {
        div.classList.toggle('selected');
        if (gameState.selectedAnswers.includes(option))
          gameState.selectedAnswers = gameState.selectedAnswers.filter(a => a !== option);
        else
          gameState.selectedAnswers.push(option);
      }
    };
    optionsContainer.appendChild(div);
  });

  renderTeamSelector();
  updateCurrentTeamInfo();
  submitBtn.style.display = 'inline-block';
  endAnswerBtn.style.display = 'none';
  correctBtn.style.display = 'none';
  wrongBtn.style.display = 'none';

  if (gameState.mode === 'answer') startTimer(30);
  updateRemainingCount();
}

// ===== 提交答案（普通题+加赛题统一） =====
submitBtn.onclick = () => {
  if (hasSubmitted) return;
  const q = gameState.currentQuestion;
  if (!q) return;
  if (gameState.selectedAnswers.length === 0) { alert('请选择答案'); return; }
  hasSubmitted = true;
  stopTimer();
  submitBtn.disabled = true;

  if (gameState.mode === 'bonus') {

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

    let winner;

    if (isCorrect) {

      winner =
        currentBonusPair.find(
          t => t.id === gameState.selectedTeam
        );

      resultArea.innerText =
        `回答正确！\n正确答案：${q.answer.join('、')}\n${winner.name} 获胜 +5分`;

    } else {

      winner =
        currentBonusPair.find(
          t => t.id !== gameState.selectedTeam
        );

      resultArea.innerText =
        `回答错误！\n正确答案：${q.answer.join('、')}\n${winner.name} 获胜 +5分`;

    }

    updateScore(winner.id, 5);

    renderScoreboard();

    return;
  }

  let targetTeamId = gameState.mode === 'answer' ? gameState.currentAnswerTeam : gameState.selectedTeam;
  const selected = [...gameState.selectedAnswers].sort().join(',');
  const answer = [...q.answer].sort().join(',');
  const isCorrect = selected === answer;
  const points = 10;
  if (isCorrect) resultArea.innerText = `回答正确！ +${points}分`, updateScore(targetTeamId, points);
  else {
    if (gameState.mode === 'answer') resultArea.innerText = `回答错误！正确答案：${q.answer.join(',')}`;
    else resultArea.innerText = `回答错误！正确答案：${q.answer.join(',')} 扣${points}分`, updateScore(targetTeamId, -points);
  }
  if (gameState.mode === 'answer') gameState.teams[targetTeamId - 1].answerCount++;
  renderScoreboard();
};

// ===== 风险题结束作答逻辑 =====
endAnswerBtn.onclick = () => {
  stopTimer();
  const q = gameState.currentQuestion;
  if (!q) return;
  questionText.innerText = `${q.question}\n\n答案：${q.answer.join('、')}`;
  endAnswerBtn.style.display = 'none';
  correctBtn.style.display = 'inline-block';
  wrongBtn.style.display = 'inline-block';
};

correctBtn.onclick = () => {
  updateScore(currentRiskTeam, currentRiskPoints);
  resultArea.innerText = `回答正确！ +${currentRiskPoints}分`;
  renderScoreboard();
  correctBtn.style.display = 'none';
  wrongBtn.style.display = 'none';
};

wrongBtn.onclick = () => {
  updateScore(currentRiskTeam, -currentRiskPoints);
  resultArea.innerText = `回答错误！ -${currentRiskPoints}分`;
  renderScoreboard();
  correctBtn.style.display = 'none';
  wrongBtn.style.display = 'none';
};

// ===== 下一题统一逻辑 =====
nextBtn.onclick = () => {
  stopTimer();
  resultArea.innerText = '';
  questionText.innerText = '';
  optionsContainer.innerHTML = '';
  gameState.selectedAnswers = [];
  hasSubmitted = false;
  submitBtn.disabled = false;

  if (gameState.mode === 'bonus') {
    nextBonusPair();
    return;
  }

  if (gameState.mode === 'risk') {
    currentRiskTeam++;
    riskSelector.innerHTML = '';
    timerElement.innerText = '';
    if (currentRiskTeam > gameState.teams.length) { alert('风险题阶段结束！'); switchMode('home'); startContainer.style.display = 'block'; questionContainer.style.display = 'none'; return; }
    updateCurrentTeamInfo();
    questionText.innerText = '🎯 请选择风险题分值';
    renderRiskSelector();
    submitBtn.style.display = 'none';
    endAnswerBtn.style.display = 'none';
    correctBtn.style.display = 'none';
    wrongBtn.style.display = 'none';
    return;
  }

  if (gameState.mode === 'answer') {
    const team = gameState.teams[gameState.currentAnswerTeam - 1];
    const teamPool = gameState.teamQuestionSets[gameState.currentAnswerTeam];
    const remaining = teamPool ? teamPool.filter(q => !q.used).length : 0;
    // 答满题目数 或 题目池已空 → 切换到下一队
    if (team.answerCount >= gameState.maxAnswerQuestions || remaining === 0) {
      if (gameState.currentAnswerTeam < gameState.teams.length) {
        gameState.currentAnswerTeam++;
        startContainer.style.display = 'flex';
        questionContainer.style.display = 'none';
        stopTimer();
        questionText.innerText = '';
        optionsContainer.innerHTML = '';
        resultArea.innerText = '';
        timerElement.innerText = '';
        return;
      } else {
        alert('必答题阶段结束！');
        switchMode('home');
        startContainer.style.display = 'flex';
        questionContainer.style.display = 'none';
        stopTimer();
        timerElement.innerText = '';
        return;
      }
    }
  }

  if (gameState.mode === 'buzzer') {
    stopTimer();
    hasSubmitted = false;
    gameState.selectedTeam = null;
    timerElement.innerText = '';
    resultArea.innerText = '';
    submitBtn.disabled = false;
    renderTeamSelector();
  }

  renderQuestion();
};

// ===== 开始答题按钮逻辑 =====
startBtn.onclick = () => {
  startContainer.style.display = 'none';
  questionContainer.style.display = 'block';
  bonusMatchInfo.style.display = 'none';
  timerElement.style.display = 'block';

  if (gameState.mode === 'risk') {
    currentRiskTeam = 1;
    updateCurrentTeamInfo();
    questionText.innerText = '🎯 请选择风险题分值';
    renderRiskSelector();
    timerElement.innerText = '';
    submitBtn.style.display = 'none';
    endAnswerBtn.style.display = 'none';
    correctBtn.style.display = 'none';
    wrongBtn.style.display = 'none';
    return;
  }

  if (gameState.mode === 'bonus') {
    renderBonusQuestion();
    return;
  }

  renderQuestion();
};

// ===== 加赛题相关逻辑 =====
function startBonus() {
  // 构建平分队伍队列
  bonusQueue = [];
  const sortedTeams = [...gameState.teams].sort((a, b) => b.score - a.score);
  for (let i = 0; i < sortedTeams.length - 1; i++) {
    if (sortedTeams[i].score === sortedTeams[i + 1].score) {
      bonusQueue.push([sortedTeams[i], sortedTeams[i + 1]]);
    }
  }
  if (bonusQueue.length === 0) { alert('没有需要加赛的平分队伍'); switchMode('home'); return; }
  gameState.mode = 'bonus';
  nextBonusPair();
}

function nextBonusPair() {

  if (bonusQueue.length === 0) {

    alert('加赛题结束');

    switchMode('home');

    bonusMatchInfo.style.display = 'none';

    return;

  }

  currentBonusPair = bonusQueue.shift();

  startContainer.style.display = 'flex';

  questionContainer.style.display = 'none';

  bonusMatchInfo.style.display = 'flex';

  if (bonusTeamA) bonusTeamA.innerText = currentBonusPair[0].name;
  if (bonusTeamB) bonusTeamB.innerText = currentBonusPair[1].name;
}

function renderBonusQuestion() {
  teamSelector.innerHTML = '';
  timerElement.style.display = 'none';
  hasSubmitted = false;
  submitBtn.disabled = false;
  const question = getRandomQuestion('bonus');
  gameState.currentQuestion = question;
  questionText.innerText = question.question;
  optionsContainer.innerHTML = '';
  resultArea.innerText = '';
  gameState.selectedAnswers = [];

  currentBonusPair.forEach(team => {

    const btn = document.createElement('button');

    btn.className = 'team-button';

    btn.innerText = team.name;

    if (gameState.selectedTeam === team.id) {
      btn.classList.add('active');
    }

    btn.onclick = () => {

      if (hasSubmitted) return;

      gameState.selectedTeam = team.id;
      timerElement.style.display = 'block';

      // 清除其他按钮选中状态
      document
        .querySelectorAll('#team-selector .team-button')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      startTimer(30);

    };

    teamSelector.appendChild(btn);

  });

  question.options.forEach(option => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerText = option;
    div.onclick = () => {
      if (hasSubmitted) return;
      document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      gameState.selectedAnswers = [option.charAt(0)];
    };
    optionsContainer.appendChild(div);
  });

  submitBtn.style.display = 'inline-block';
  endAnswerBtn.style.display = 'none';
  correctBtn.style.display = 'none';
  wrongBtn.style.display = 'none';

  startContainer.style.display = 'none';
  questionContainer.style.display = 'block';
}

// ===== 页面初始化 =====
switchMode('home');
renderScoreboard();
startContainer.style.display = 'block';
questionContainer.style.display = 'none';

// ===== 对外暴露加赛题 =====
window.startBonus = startBonus;
window.startQuestion = () => {
  stopTimer();
  startContainer.style.display = 'block';
  questionContainer.style.display = 'none';
  questionText.innerText = '';
  optionsContainer.innerHTML = '';
  resultArea.innerText = '';
  teamInfo.innerText = '';
  teamSelector.innerHTML = '';
  riskSelector.innerHTML = '';
  bonusMatchInfo.style.display = 'none';
  timerElement.style.display = 'block';
  gameState.currentQuestion = null;
  gameState.selectedAnswers = [];
  gameState.selectedTeam = null;
  hasSubmitted = false;
  submitBtn.disabled = false;
  submitBtn.style.display = 'inline-block';
  endAnswerBtn.style.display = 'none';
  correctBtn.style.display = 'none';
  wrongBtn.style.display = 'none';
  timerElement.innerText = '';
  updateRemainingCount();
};
fullscreenBtn.onclick = () => {

  if (!document.fullscreenElement) {

    document.documentElement.requestFullscreen();

    fullscreenBtn.innerText = '退出全屏';

  } else {

    document.exitFullscreen();

    fullscreenBtn.innerText = '全屏';

  }

};
document.addEventListener(
  'fullscreenchange',
  () => {

    if (document.fullscreenElement) {

      fullscreenBtn.innerText =
        '退出全屏';

    } else {

      fullscreenBtn.innerText =
        '全屏';

    }

  }
);

// ===== 禁止快捷键缩放 & 右键菜单（现场展示防误触） =====
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.metaKey) e.preventDefault();
}, { passive: false });

document.addEventListener('keydown', (e) => {
  // 禁止 Ctrl +/-/0 缩放
  if ((e.ctrlKey || e.metaKey) && ['+', '-', '0', '=', '_'].includes(e.key)) {
    e.preventDefault();
  }
});

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});