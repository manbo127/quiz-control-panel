import { gameState } from './gameState.js';

// ===== 随机抽题 =====
export function getRandomQuestion(mode, riskScore = null) {

  let pool = [];

  // ===== 必答题 =====
  if (mode === 'answer') {

    pool =
      gameState.answerQuestions
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

  // 必答题
  gameState.answerQuestions.forEach(q => {
    q.used = false;
  });

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

}