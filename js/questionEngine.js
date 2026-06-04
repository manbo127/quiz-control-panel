import {
  gameState,
  answerQuestionSets
} from './gameState.js';

function initializeTeamQuestionSets() {

  // 已初始化
  if (Object.keys(gameState.teamQuestionSets).length > 0) {
    return;
  }

  // 题库编号
  const setIds =
    Object.keys(answerQuestionSets);

  // Fisher-Yates 洗牌
  for (let i = setIds.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [setIds[i], setIds[j]] =
      [setIds[j], setIds[i]];
  }

  // 分配题库
  gameState.teams.forEach((team, index) => {

    const setId = setIds[index];

    gameState.teamQuestionSets[team.id] =
      answerQuestionSets[setId].map(q => ({
        ...q,
        used: false
      }));

  });

}

// ===== 随机抽题 =====
export function getRandomQuestion(mode, riskScore = null) {

  let pool = [];

  // ===== 必答题 =====
  if (mode === 'answer') {

  initializeTeamQuestionSets();

  const teamId =
    gameState.currentAnswerTeam;

  pool =
    gameState.teamQuestionSets[teamId]
      .filter(q => !q.used);

}

  // ===== 抢答题 =====
  else if (mode === 'buzzer') {

    pool =
      gameState.buzzerQuestions
        .filter(q => !q.used);

  }

  // ===== 风险题（简述题） =====
  else if (mode === 'risk') {

    // 优先使用传入分值
    const score =
      riskScore || gameState.selectedRisk;

    // 没选分值
    if (!score) {
      return null;
    }

    // 对应分值题池
    pool =
      gameState.riskQuestions[score]
        .filter(q => !q.used);

  }

  else if (mode === 'bonus') {

    pool =
      gameState.bonusQuestions
        .filter(q => !q.used);

  }

  // ===== 没题了 =====
  if (pool.length === 0) {

    return null;

  }

  // ===== 随机抽题 =====
  const index =
    Math.floor(Math.random() * pool.length);

  const question = pool[index];

  // ===== 标记已使用 =====
  question.used = true;

  return question;
}


// ===== 重置所有题目 =====
export function resetQuestions() {

  // 重新随机分配题库
  gameState.teamQuestionSets = {};

  // 抢答题
  gameState.buzzerQuestions.forEach(q => {
    q.used = false;
  });

  // 风险题
  Object.keys(gameState.riskQuestions)
    .forEach(score => {

      gameState.riskQuestions[score]
        .forEach(q => {
          q.used = false;
        });

    });

  // 加赛题
  gameState.bonusQuestions.forEach(q => {
    q.used = false;
  });

}