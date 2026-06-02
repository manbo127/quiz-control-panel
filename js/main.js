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

const endAnswerBtn = document.getElementById('end-answer-btn');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');

let hasSubmitted = false;

// ===== 风险题状态 =====
let currentRiskTeam = 1;
let currentRiskPoints = 0;

// ===== 更新当前队伍 =====
function updateCurrentTeamInfo() {

  if (gameState.mode === 'answer') {

    const team =
      gameState.teams[gameState.currentAnswerTeam - 1];

    teamInfo.innerText =
      `当前队伍：${team.name} （第 ${team.answerCount + 1} / ${gameState.maxAnswerQuestions} 题）`;
  }

  else if (gameState.mode === 'buzzer') {

    if (gameState.selectedTeam) {

      const team =
        gameState.teams[gameState.selectedTeam - 1];

      teamInfo.innerText =
        `当前抢答队伍：${team.name}`;
    }
  }

  else if (gameState.mode === 'risk') {

    const team =
      gameState.teams[currentRiskTeam - 1];

    teamInfo.innerText =
      `当前风险题队伍：${team.name}`;
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

    if (gameState.selectedTeam === team.id) {
      btn.classList.add('active');
    }

    btn.onclick = () => {

      if (hasSubmitted) return;

      gameState.selectedTeam = team.id;

      renderTeamSelector();

      updateCurrentTeamInfo();
    };

    teamSelector.appendChild(btn);
  });
}

// ===== 风险题分值 =====
function renderRiskSelector() {

  riskSelector.innerHTML = '';

  if (gameState.mode !== 'risk') return;

  [20, 30, 40].forEach(score => {

    const btn = document.createElement('button');

    btn.className = 'team-button';

    btn.innerText = `${score}分`;

    btn.onclick = () => {

      currentRiskPoints = score;

      const question =
        getRandomQuestion('risk', score);

      gameState.currentQuestion = question;

      if (!question) {

        questionText.innerText =
          '该分值暂无题目';

        return;
      }

      // 只显示题干
      questionText.innerText =
        question.question;

      optionsContainer.innerHTML = '';

      resultArea.innerText = '';

      // 风险题按钮显示
      submitBtn.style.display = 'none';

      endAnswerBtn.style.display = 'inline-block';

      correctBtn.style.display = 'none';

      wrongBtn.style.display = 'none';
    };

    riskSelector.appendChild(btn);
  });
}

// ===== 渲染普通题 =====
function renderQuestion() {

  hasSubmitted = false;

  submitBtn.disabled = false;

  const question =
    getRandomQuestion(gameState.mode);

  gameState.currentQuestion = question;

  if (!question) {

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

  question.options.forEach(option => {

    const div =
      document.createElement('div');

    div.className = 'option';

    div.innerText = option;

    div.onclick = () => {

      if (hasSubmitted) return;

      if (question.type === 'single') {

        document.querySelectorAll('.option')
          .forEach(o =>
            o.classList.remove('selected'));

        div.classList.add('selected');

        gameState.selectedAnswers = [option];
      }

      else {

        div.classList.toggle('selected');

        if (gameState.selectedAnswers.includes(option)) {

          gameState.selectedAnswers =
            gameState.selectedAnswers.filter(
              a => a !== option
            );
        }

        else {

          gameState.selectedAnswers.push(option);
        }
      }
    };

    optionsContainer.appendChild(div);
  });

  renderTeamSelector();

  updateCurrentTeamInfo();

  // 普通题显示提交按钮
  submitBtn.style.display = 'inline-block';

  endAnswerBtn.style.display = 'none';

  correctBtn.style.display = 'none';

  wrongBtn.style.display = 'none';
}

// ===== 提交普通题 =====
submitBtn.onclick = () => {

  if (hasSubmitted) return;

  const q = gameState.currentQuestion;

  if (!q) return;

  if (gameState.selectedAnswers.length === 0) {

    alert('请选择答案');

    return;
  }

  let targetTeamId = 1;

  // 必答题
  if (gameState.mode === 'answer') {

    targetTeamId =
      gameState.currentAnswerTeam;
  }

  // 抢答题
  else if (gameState.mode === 'buzzer') {

    if (!gameState.selectedTeam) {

      alert('请先选择抢答队伍');

      return;
    }

    targetTeamId =
      gameState.selectedTeam;
  }

  hasSubmitted = true;

  submitBtn.disabled = true;

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

  const points = 10;

  // ===== 答对 =====
  if (isCorrect) {

    resultArea.innerText =
      `回答正确！ +${points}分`;

    updateScore(targetTeamId, points);
  }

  // ===== 答错 =====
  else {

    // 必答题不扣分
    if (gameState.mode === 'answer') {

      resultArea.innerText =
        `回答错误！正确答案：${q.answer.join(',')}`;
    }

    // 抢答题扣分
    else {

      resultArea.innerText =
        `回答错误！正确答案：${q.answer.join(',')} 扣${points}分`;

      updateScore(targetTeamId, -points);
    }
  }

  // 必答题次数
  if (gameState.mode === 'answer') {

    gameState.teams[targetTeamId - 1]
      .answerCount++;
  }

  renderScoreboard();
};

// ===== 风险题结束作答 =====
endAnswerBtn.onclick = () => {

  const q =
    gameState.currentQuestion;

  if (!q) return;

  // 显示答案
  questionText.innerText =
    `${q.question}\n\n答案：${q.answer.join(',')}`;

  endAnswerBtn.style.display = 'none';

  correctBtn.style.display = 'inline-block';

  wrongBtn.style.display = 'inline-block';
};

// ===== 风险题正确 =====
correctBtn.onclick = () => {

  updateScore(
    currentRiskTeam,
    currentRiskPoints
  );

  resultArea.innerText =
    `回答正确！ +${currentRiskPoints}分`;

  renderScoreboard();

  correctBtn.style.display = 'none';

  wrongBtn.style.display = 'none';
};

// ===== 风险题错误 =====
wrongBtn.onclick = () => {

  updateScore(
    currentRiskTeam,
    -currentRiskPoints
  );

  resultArea.innerText =
    `回答错误！ -${currentRiskPoints}分`;

  renderScoreboard();

  correctBtn.style.display = 'none';

  wrongBtn.style.display = 'none';
};

// ===== 下一题（统一逻辑）=====
nextBtn.onclick = () => {

  resultArea.innerText = '';

  questionText.innerText = '';

  optionsContainer.innerHTML = '';

  gameState.selectedAnswers = [];

  hasSubmitted = false;

  submitBtn.disabled = false;

  // ===== 风险题 =====
  if (gameState.mode === 'risk') {

    currentRiskTeam++;

    riskSelector.innerHTML = '';

    if (currentRiskTeam > gameState.teams.length) {

      alert('风险题阶段结束！');

      switchMode('home');

      startContainer.style.display = 'block';

      questionContainer.style.display = 'none';

      return;
    }

    updateCurrentTeamInfo();

    questionText.innerText =
      '请选择分值';

    renderRiskSelector();

    submitBtn.style.display = 'none';

    endAnswerBtn.style.display = 'none';

    correctBtn.style.display = 'none';

    wrongBtn.style.display = 'none';

    return;
  }

  // ===== 必答题 =====
  if (gameState.mode === 'answer') {

    const team =
      gameState.teams[
        gameState.currentAnswerTeam - 1
      ];

    if (
      team.answerCount >=
      gameState.maxAnswerQuestions
    ) {

      if (
        gameState.currentAnswerTeam <
        gameState.teams.length
      ) {

        gameState.currentAnswerTeam++;
      }

      else {

        alert('必答题阶段结束！');

        switchMode('home');

        startContainer.style.display = 'block';

        questionContainer.style.display = 'none';

        return;
      }
    }
  }

  // 抢答题重置
  if (gameState.mode === 'buzzer') {

    gameState.selectedTeam = null;

    renderTeamSelector();
  }

  renderQuestion();
};

// ===== 开始答题 =====
startBtn.onclick = () => {

  startContainer.style.display = 'none';

  questionContainer.style.display = 'block';

  // 风险题
  if (gameState.mode === 'risk') {

    currentRiskTeam = 1;

    updateCurrentTeamInfo();

    questionText.innerText =
      '请选择分值';

    renderRiskSelector();

    submitBtn.style.display = 'none';

    endAnswerBtn.style.display = 'none';

    correctBtn.style.display = 'none';

    wrongBtn.style.display = 'none';

    return;
  }

  renderQuestion();
};

// ===== 页面初始化 =====
switchMode('home');

renderScoreboard();

startContainer.style.display = 'block';

questionContainer.style.display = 'none';

// ===== 切换模式 =====
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

  hasSubmitted = false;

  submitBtn.disabled = false;

  submitBtn.style.display = 'inline-block';

  endAnswerBtn.style.display = 'none';

  correctBtn.style.display = 'none';

  wrongBtn.style.display = 'none';
};