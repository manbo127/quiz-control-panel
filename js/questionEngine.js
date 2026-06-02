import { gameState } from './gameState.js';

export function getRandomQuestion(mode){

  let pool = [];

  // 必答题
  if(mode === 'answer'){

    pool =
      gameState.answerQuestions
        .filter(q=>!q.used);

  }

  // 抢答题
  if(mode === 'buzzer'){

    pool =
      gameState.buzzerQuestions
        .filter(q=>!q.used);

  }

  // 风险题
  if(mode === 'risk'){

    // 必须先选择分值
    if(!gameState.selectedRisk){
      return null;
    }

    pool =
      gameState.riskQuestions[
        gameState.selectedRisk
      ].filter(q=>!q.used);

  }

  // 没题了
  if(pool.length === 0){
    return null;
  }

  // 随机抽题
  const index =
    Math.floor(Math.random()*pool.length);

  // 标记已使用
  pool[index].used = true;

  return pool[index];

}