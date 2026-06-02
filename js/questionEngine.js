import { gameState } from './gameState.js';

export function getRandomQuestion(mode){

  let pool = [];

  if(mode === 'answer'){
    pool = gameState.answerQuestions.filter(q=>!q.used);
  }

  if(mode === 'buzzer'){
    pool = gameState.buzzerQuestions.filter(q=>!q.used);
  }

  if(pool.length === 0){
    return null;
  }

  const index = Math.floor(Math.random()*pool.length);

  pool[index].used = true;

  return pool[index];
}
